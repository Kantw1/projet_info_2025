<?php
session_start();
header('Content-Type: application/json');
$conn = new mysqli("localhost", "root", "", "smarthouse");
$conn->set_charset("utf8mb4");

// Vérifier la session
if (!isset($_SESSION['objets_connectes']['Arrosage'])) {
    echo json_encode(["success" => false, "error" => "Aucun arrosage défini en session"]);
    exit();
}

$idArrosage = $_SESSION['objets_connectes']['Arrosage'][0];

// Récupérer l'heure depuis le body JSON
$data = json_decode(file_get_contents("php://input"), true);
$heure = $data['heure'] ?? null;

if (!$heure || !preg_match("/^\d{2}:\d{2}$/", $heure)) {
    echo json_encode(["success" => false, "error" => "Format d'heure invalide"]);
    exit();
}

// Insérer dans la base (en format TIME)
$heure .= ":00"; // pour correspondre à TIME
$stmt = $conn->prepare("INSERT INTO planning_arrosage (id_objet_connecte, heure) VALUES (?, ?)");
$stmt->bind_param("is", $idArrosage, $heure);

try {
    $stmt->execute();
    echo json_encode(["success" => true]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

$stmt->close();
$conn->close();
