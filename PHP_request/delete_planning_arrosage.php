<?php
session_start();
header('Content-Type: application/json');
$conn = new mysqli("localhost", "root", "", "smarthouse");
$conn->set_charset("utf8mb4");

// Vérification de la session
if (!isset($_SESSION['objets_connectes']['Arrosage'])) {
    echo json_encode(["success" => false, "error" => "Aucun arrosage trouvé en session"]);
    exit();
}

$idArrosage = $_SESSION['objets_connectes']['Arrosage'][0];

// Récupération de l’heure à supprimer
$data = json_decode(file_get_contents("php://input"), true);
$heure = $data['heure'] ?? null;

if (!$heure || !preg_match("/^\d{2}:\d{2}$/", $heure)) {
    echo json_encode(["success" => false, "error" => "Format d'heure invalide"]);
    exit();
}

$heure .= ":00"; // Adaptation au format TIME (HH:MM:SS)

// Suppression
$stmt = $conn->prepare("DELETE FROM planning_arrosage WHERE id_objet_connecte = ? AND heure = ?");
$stmt->bind_param("is", $idArrosage, $heure);

try {
    $stmt->execute();
    echo json_encode(["success" => true]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

$id = $_SESSION['id'];

 // Incrémenter les points
            $updateStmt = $conn->prepare("UPDATE USERS SET point = point + 2 WHERE id = ?");
            $updateStmt->bind_param("i", $id);
            $updateStmt->execute();
            $updateStmt->close();


$stmt->close();
$conn->close();
