<?php
session_start();
header('Content-Type: application/json');

// Connexion à la base de données
$conn = new mysqli("localhost", "root", "", "smarthouse");
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Erreur de connexion à la base de données"]);
    exit();
}

// Vérifie si l'utilisateur est connecté
if (!isset($_SESSION['id_house'])) {
    echo json_encode(["success" => false, "error" => "Utilisateur non connecté"]);
    exit();
}

$idHouse = $_SESSION['id_house']; // id de la maison récupéré de la session

// Récupération des données envoyées via POST
$data = json_decode(file_get_contents('php://input'), true);

$idObjetConnecte = $data['id_objet_connecte'] ?? null;
$etat = $data['etat'] ?? null;session_start();
header('Content-Type: application/json');

// Connexion à la base de données
$conn = new mysqli("localhost", "root", "", "smarthouse");
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Erreur de connexion à la base de données"]);
    exit();
}

if (!isset($_SESSION['id_house'])) {
    echo json_encode(["success" => false, "error" => "Utilisateur non connecté"]);
    exit();
}

$idHouse = $_SESSION['id_house']; // id de la maison récupéré de la session

// Récupération des données envoyées via POST
$data = json_decode(file_get_contents('php://input'), true);

$idObjetConnecte = $data['id_objet_connecte'] ?? null;
$etat = $data['etat'] ?? null;
$intensite = $data['intensite'] ?? null;
$couleur = $data['couleur'] ?? null;

if ($idObjetConnecte === null || $etat === null || $intensite === null || $couleur === null) {
    echo json_encode(["success" => false, "error" => "Données manquantes"]);
    exit();
}

// Debug: Voir les valeurs reçues
error_log("id_objet_connecte: $idObjetConnecte, etat: $etat, intensite: $intensite, couleur: $couleur");

$sql = "UPDATE lumiere 
        SET etat = ?, intensite = ?, couleur = ?, derniere_interaction = CURRENT_TIMESTAMP
        WHERE id_objet_connecte = ? AND EXISTS (SELECT 1 FROM objet_connecte WHERE id = ? AND id_house = ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("iiisi", $etat, $intensite, $couleur, $idObjetConnecte, $idObjetConnecte, $idHouse);

if ($stmt->execute()) {
    // Optionnellement, insère un historique dans la table historique_lumiere
    $stmtHistorique = $conn->prepare("
        INSERT INTO historique_lumiere (id_objet_connecte, id_user, etat, intensite, couleur, consommation_electricite, action)
        VALUES (?, ?, ?, ?, ?, 0.06 * ? / 100, ?)
    ");
    $action = $etat ? "Allumée" : "Éteinte";
    $stmtHistorique->bind_param("iiisdis", $idObjetConnecte, $_SESSION['id_user'], $etat, $intensite, $couleur, $intensite, $action);
    $stmtHistorique->execute();

    // Vérification si la mise à jour s'est bien effectuée
    echo json_encode(["success" => true]);
} else {
    // Si une erreur SQL se produit, afficher un message
    echo json_encode(["success" => false, "error" => "Échec de la mise à jour de la lumière"]);
}

$stmt->close();
$conn->close();

$intensite = $data['intensite'] ?? null;
$couleur = $data['couleur'] ?? null;

if ($idObjetConnecte === null || $etat === null || $intensite === null || $couleur === null) {
    echo json_encode(["success" => false, "error" => "Données manquantes"]);
    exit();
}

// Met à jour les données de la lumière dans la base de données
$sql = "UPDATE lumiere 
        SET etat = ?, intensite = ?, couleur = ?, derniere_interaction = CURRENT_TIMESTAMP
        WHERE id_objet_connecte = ? AND id_objet_connecte IN (SELECT id FROM objet_connecte WHERE id_house = ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("iiisi", $etat, $intensite, $couleur, $idObjetConnecte, $idHouse);

 else {
    echo json_encode(["success" => false, "error" => "Échec de la mise à jour de la lumière"]);
}

$stmt->close();
$conn->close();
?>
