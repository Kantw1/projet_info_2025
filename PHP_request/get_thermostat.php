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

// Vérifie que l'utilisateur est connecté et que la liste des objets est disponible
if (!isset($_SESSION['id_house']) || !isset($_SESSION['objets_connectes'])) {
    http_response_code(403);
    echo json_encode(["error" => "Session invalide"]);
    exit();
}

$thermostatIds = $_SESSION['objets_connectes']['Thermostat'] ?? [];

if (empty($thermostatIds)) {
    echo json_encode([]); // Aucun thermostat
    exit();
}

// Construction dynamique du IN (...)
$placeholders = implode(',', array_fill(0, count($thermostatIds), '?'));
$sql = "SELECT * FROM thermostat WHERE id_objet_connecte IN ($placeholders)";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur dans la requête SQL"]);
    exit();
}

// Bind les paramètres dynamiquement
$stmt->bind_param(str_repeat('i', count($thermostatIds)), ...$thermostatIds);
$stmt->execute();
$result = $stmt->get_result();

$thermostats = [];
while ($row = $result->fetch_assoc()) {
    $thermostats[] = $row;
}

$stmt->close();
$conn->close();

header('Content-Type: application/json');
echo json_encode($thermostats);
?>
