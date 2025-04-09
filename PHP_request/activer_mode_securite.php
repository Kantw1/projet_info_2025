<?php
session_start();
header('Content-Type: application/json');

// Connexion à la BDD
$host = "localhost";
$dbname = "smarthouse";
$username = "root";
$password = "";

$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Connexion échouée"]);
    exit();
}

// Vérifie la session
if (!isset($_SESSION['objets_connectes']['VoletRoulant'])) {
    http_response_code(403);
    echo json_encode(["error" => "Session invalide"]);
    exit();
}

$voletIds = $_SESSION['objets_connectes']['VoletRoulant'];
if (empty($voletIds)) {
    echo json_encode(["error" => "Aucun volet trouvé"]);
    exit();
}

// Préparer la requête
$placeholders = implode(',', array_fill(0, count($voletIds), '?'));
$sql = "UPDATE volet_roulant SET mode_securite = TRUE WHERE id_objet_connecte IN ($placeholders)";
$stmt = $conn->prepare($sql);
$stmt->bind_param(str_repeat('i', count($voletIds)), ...$voletIds);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(["success" => true, "updated" => $stmt->affected_rows]);
} else {
    echo json_encode(["success" => false, "message" => "Aucune ligne modifiée"]);
}

$stmt->close();
$conn->close();
?>
