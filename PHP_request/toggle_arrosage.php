<?php
session_start();
header('Content-Type: application/json');
$conn = new mysqli("localhost", "root", "", "smarthouse");
$conn->set_charset("utf8mb4");

// 🔐 Vérification session
if (!isset($_SESSION['objets_connectes']['Arrosage']) || !isset($_SESSION['id'])) {
    echo json_encode(["success" => false, "error" => "Session invalide"]);
    exit();
}

$idArrosage = $_SESSION['objets_connectes']['Arrosage'][0];

// 🕒 Récupérer état actuel et heure de dernière activation AVANT mise à jour
$stmt = $conn->prepare("SELECT actif, heure_modification FROM arrosage WHERE id_objet_connecte = ?");
$stmt->bind_param("i", $idArrosage);
$stmt->execute();
$result = $stmt->get_result();
$data = $result->fetch_assoc();
$stmt->close();

if (!$data) {
    echo json_encode(["success" => false, "error" => "Arrosage introuvable"]);
    exit();
}

$actuel = (bool)$data['actif'];
$heureModif = $data['heure_modification'];
$nouvelEtat = !$actuel;

// 🕒 Date actuelle formatée
$now = (new DateTime())->format('Y-m-d H:i:s');

// ✅ Mise à jour manuelle de l’état ET de la date
$stmt = $conn->prepare("UPDATE arrosage SET actif = ?, heure_modification = ? WHERE id_objet_connecte = ?");
$stmt->bind_param("isi", $nouvelEtat, $now, $idArrosage);
$stmt->execute();
$stmt->close();

$response = [
    "success" => true,
    "actif" => $nouvelEtat
];

// ⏱️ Si on vient de désactiver → calculer durée depuis heure_modification
if ($actuel === true && $nouvelEtat === false && $heureModif) {
    $debut = new DateTime($heureModif);
    $fin = new DateTime($now);  // on utilise le même "now" que dans la BDD

    $diffSeconds = $fin->getTimestamp() - $debut->getTimestamp();
    $dureeMinutes = max(1, floor($diffSeconds / 60));

    // 💾 Historique
    $stmt = $conn->prepare("
        INSERT INTO historique_arrosage (id_objet_connecte, duree_minutes)
        VALUES (?, ?)
    ");
    $stmt->bind_param("ii", $idArrosage, $dureeMinutes);
    $stmt->execute();
    $stmt->close();

    $response["historique_ajoute"] = true;
    $response["duree"] = $dureeMinutes;
}

echo json_encode($response);
$conn->close();
