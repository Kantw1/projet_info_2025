<?php
session_start();
header('Content-Type: application/json');

$conn = new mysqli("localhost", "root", "", "smarthouse");
$conn->set_charset("utf8mb4");

// 🔒 Vérification session
if (!isset($_SESSION['objets_connectes']['PanneauSolaire'])) {
    echo json_encode(["success" => false, "error" => "Session invalide"]);
    exit();
}

$idPanneau = $_SESSION['objets_connectes']['PanneauSolaire'][0];

// 📥 Lecture du JSON reçu
$input = json_decode(file_get_contents("php://input"), true);
if (!isset($input['capacite']) || !is_numeric($input['capacite']) || $input['capacite'] <= 0) {
    echo json_encode(["success" => false, "error" => "Valeur de capacité invalide"]);
    exit();
}

$nouvelleCapacite = floatval($input['capacite']);

// 🛠️ Mise à jour dans la BDD (derniere_mise_a_jour se met à jour automatiquement)
$stmt = $conn->prepare("UPDATE panneau_solaire SET capacite_kwc = ? WHERE id_objet_connecte = ?");
$stmt->bind_param("di", $nouvelleCapacite, $idPanneau);
$success = $stmt->execute();
$stmt->close();

if ($success) {
    echo json_encode(["success" => true, "capacite" => $nouvelleCapacite]);
    
 // Incrémenter les points
            $updateStmt = $conn->prepare("UPDATE USERS SET point = point + 2 WHERE id = ?");
            $updateStmt->bind_param("i", $id);
            $updateStmt->execute();
            $updateStmt->close();
} else {
    echo json_encode(["success" => false, "error" => "Erreur lors de la mise à jour"]);
}

$id = $_SESSION['id'];


$conn->close();
