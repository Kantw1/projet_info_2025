<?php
ob_start();
session_start();
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Connexion PDO
try {
    $pdo = new PDO("mysql:host=localhost;dbname=smarthouse;charset=utf8mb4", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur de connexion : ' . $e->getMessage()]);
    exit;
}

// Vérifie que l'utilisateur a une maison associée
if (!isset($_SESSION['id_house'])) {
    echo json_encode(['success' => false, 'message' => 'id_house manquant en session']);
    exit;
}
$idHouse = intval($_SESSION['id_house']);

// Lecture des données JSON envoyées
$rawData = file_get_contents("php://input");
file_put_contents("debug_input.json", $rawData); // debug
$data = json_decode($rawData, true);

if (!$data || !isset($data['type'])) {
    echo json_encode(['success' => false, 'message' => 'Données JSON invalides']);
    exit;
}

$type = strtolower($data['type']);

try {
    switch ($type) {
        case 'thermostat':
            $stmt = $pdo->prepare("INSERT INTO objet_connecte (type, id_house) VALUES (?, ?)");
            $stmt->execute([$type, $idHouse]);
            $idObjet = $pdo->lastInsertId();

            $stmt = $pdo->prepare("INSERT INTO thermostat (
                id_objet_connecte, nom_objet, position, temperature_actuelle,
                temperature_cible, humidite_cible, humidite_affichee, connectivite,
                consommation_electricite, derniere_interaction, type_interaction
            ) VALUES (?, ?, ?, 20.0, ?, 45.0, 45.0, 'Signal fort', 0.0, NOW(), 'Création')");
            $stmt->execute([
                $idObjet,
                $data['nomUtilisateur'],
                $data['position'],
                $data['baseTemp']
            ]);
            break;

        case 'volet_roulant':
            $stmt = $pdo->prepare("INSERT INTO objet_connecte (type, id_house) VALUES (?, ?)");
            $stmt->execute([$type, $idHouse]);
            $idObjet = $pdo->lastInsertId();

            $stmt = $pdo->prepare("INSERT INTO volet_roulant (
                id_objet_connecte, nom_objet, position, ouverture,
                statut, connectivite, consommation_electricite, derniere_interaction,
                type_interaction, mode_securite
            ) VALUES (?, ?, ?, ?, 'fermé', 'Signal fort', 0.0, NOW(), 'Initialisation', FALSE)");
            $stmt->execute([
                $idObjet,
                $data['nomUtilisateur'],
                $data['position'],
                $data['positionInitiale']
            ]);
            break;

        case 'lumiere':
            $stmt = $pdo->prepare("INSERT INTO objet_connecte (type, id_house) VALUES (?, ?)");
            $stmt->execute([$type, $idHouse]);
            $idObjet = $pdo->lastInsertId();

            $stmt = $pdo->prepare("INSERT INTO lumiere (
                id_objet_connecte, nom, piece, etat,
                intensite, couleur, connectivite, consommation_electricite
            ) VALUES (?, ?, ?, FALSE, ?, ?, 'Fort', 0.0)");
            $stmt->execute([
                $idObjet,
                $data['nomUtilisateur'],
                $data['emplacement'],
                $data['intensite'],
                $data['couleur']
            ]);
            break;

        case 'alarme':
            $check = $pdo->prepare("
                SELECT a.id 
                FROM alarme a
                INNER JOIN objet_connecte oc ON a.id = oc.id
                WHERE oc.id_house = ?
            ");
            $check->execute([$idHouse]);
            if ($check->rowCount() > 0) {
                throw new Exception("Une alarme est déjà enregistrée pour cette maison.");
            }

            $stmt = $pdo->prepare("INSERT INTO objet_connecte (type, id_house) VALUES (?, ?)");
            $stmt->execute([$type, $idHouse]);
            $idObjet = $pdo->lastInsertId();

            $stmt = $pdo->prepare("INSERT INTO alarme (
                id, est_active, est_partielle, niveau_signal,
                consommation, mot_de_passe
            ) VALUES (?, ?, ?, 'fort', 0.0, ?)");
            $stmt->execute([
                $idObjet,
                $data['modeInitial'] === 'actif' ? 1 : 0,
                $data['modeInitial'] === 'partiel' ? 1 : 0,
                $data['motDePasse']
            ]);
            break;

        case 'panneau_solaire':
            $check = $pdo->prepare("
                SELECT ps.id_objet_connecte 
                FROM panneau_solaire ps
                INNER JOIN objet_connecte oc ON ps.id_objet_connecte = oc.id
                WHERE oc.id_house = ?
            ");
            $check->execute([$idHouse]);
            if ($check->rowCount() > 0) {
                throw new Exception("Un panneau solaire est déjà enregistré pour cette maison.");
            }

            $stmt = $pdo->prepare("INSERT INTO objet_connecte (type, id_house) VALUES (?, ?)");
            $stmt->execute([$type, $idHouse]);
            $idObjet = $pdo->lastInsertId();

            $stmt = $pdo->prepare("INSERT INTO panneau_solaire (
                id_objet_connecte, production_kw, capacite_kwc, consommation_kw,
                temperature_c, tension_v, co2_evite_kg, actif
            ) VALUES (?, 0.0, ?, 0.0, 25, 230, 0.0, TRUE)");
            $stmt->execute([
                $idObjet,
                $data['capacite']
            ]);
            break;

        case 'arrosage':
            $check = $pdo->prepare("
                SELECT a.id_objet_connecte
                FROM arrosage a
                INNER JOIN objet_connecte oc ON a.id_objet_connecte = oc.id
                WHERE oc.id_house = ?
            ");
            $check->execute([$idHouse]);
            if ($check->rowCount() > 0) {
                throw new Exception("Un système d’arrosage est déjà enregistré pour cette maison.");
            }

            $stmt = $pdo->prepare("INSERT INTO objet_connecte (type, id_house) VALUES (?, ?)");
            $stmt->execute([$type, $idHouse]);
            $idObjet = $pdo->lastInsertId();

            $stmt = $pdo->prepare("INSERT INTO arrosage (
                id_objet_connecte, actif, humidite_sol
            ) VALUES (?, TRUE, 50)");
            $stmt->execute([$idObjet]);

            $planning = $data['planning'] ?? [];
            $stmtPlanning = $pdo->prepare("INSERT INTO planning_arrosage (id_objet_connecte, heure) VALUES (?, ?)");
            foreach ($planning as $heure) {
                $stmtPlanning->execute([$idObjet, $heure]);
            }
            break;

        default:
            throw new Exception("Type d'objet non reconnu : $type");
    }

    // 🔁 Mise à jour de la session objets_connectes
    function mettreAJourSessionObjets($pdo, $idHouse) {
        $liste_objets = [];
        $stmt = $pdo->prepare("SELECT id, type FROM objet_connecte WHERE id_house = ?");
        $stmt->execute([$idHouse]);
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($result as $row) {
            $type_normalise = str_replace('_', '', ucwords(strtolower($row['type']), '_'));
            $id_obj = $row['id'];
            if (!isset($liste_objets[$type_normalise])) {
                $liste_objets[$type_normalise] = [];
            }
            $liste_objets[$type_normalise][] = $id_obj;
        }

        $_SESSION['objets_connectes'] = $liste_objets;
    }

    mettreAJourSessionObjets($pdo, $idHouse);

    echo json_encode([
        'success' => true,
        'message' => 'Objet ajouté dans objet_connecte',
        'id' => $idObjet,
        'type' => $type
    ]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur serveur : ' . $e->getMessage()]);
}
?>
