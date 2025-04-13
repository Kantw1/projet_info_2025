<?php
session_start();
header('Content-Type: application/json');

$conn = new mysqli("localhost", "root", "", "smarthouse");
$conn->set_charset("utf8mb4");

// 🔐 Vérification de session
if (!isset($_SESSION['objets_connectes']['PanneauSolaire'])) {
    echo json_encode(["success" => false, "error" => "Session invalide"]);
    exit();
}

$idPanneau = $_SESSION['objets_connectes']['PanneauSolaire'][0];

// 🔄 Récupérer l’état actuel
$stmt = $conn->prepare("SELECT actif FROM panneau_solaire WHERE id_objet_connecte = ?");
$stmt->bind_param("i", $idPanneau);
$stmt->execute();
$res = $stmt->get_result();
$data = $res->fetch_assoc();
$stmt->close();

if (!$data) {
    echo json_encode(["success" => false, "error" => "Panneau non trouvé"]);
    exit();
}

$etatActuel = (bool)$data['actif'];
$nouvelEtat = !$etatActuel;

// 🛠️ Mettre à jour état + date (grâce au ON UPDATE CURRENT_TIMESTAMP)
$stmt = $conn->prepare("UPDATE panneau_solaire SET actif = ? WHERE id_objet_connecte = ?");
$stmt->bind_param("ii", $nouvelEtat, $idPanneau);
$success = $stmt->execute();
$stmt->close();

if ($success) {
    echo json_encode([
        "success" => true,
        "etat" => $nouvelEtat ? "Actif" : "Inactif"
    ]);
} else {
    echo json_encode([
        "success" => false,
        "error" => "Échec de la mise à jour"
    ]);
}

$conn->close();
