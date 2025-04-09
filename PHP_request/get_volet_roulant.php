<?php
session_start();

// Connexion à la BDD
$host = "localhost";
$dbname = "smarthouse";
$username = "root";
$password = "";

$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur de connexion BDD"]);
    exit();
}

// Vérifie la session
if (!isset($_SESSION['id_house']) || !isset($_SESSION['objets_connectes'])) {
    http_response_code(403);
    echo json_encode(["error" => "Session invalide"]);
    exit();
}

$voletIds = $_SESSION['objets_connectes']['VoletRoulant'] ?? [];

if (empty($voletIds)) {
    echo json_encode([]); // Aucun volet roulant
    exit();
}

$placeholders = implode(',', array_fill(0, count($voletIds), '?'));
$sql = "SELECT * FROM volet_roulant WHERE id_objet_connecte IN ($placeholders)";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur dans la requête SQL"]);
    exit();
}

$stmt->bind_param(str_repeat('i', count($voletIds)), ...$voletIds);
$stmt->execute();
$result = $stmt->get_result();

$volets = [];
while ($row = $result->fetch_assoc()) {
    $volets[] = $row;
}

$stmt->close();
$conn->close();

header('Content-Type: application/json');
echo json_encode($volets);
?>
