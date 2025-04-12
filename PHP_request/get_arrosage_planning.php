<?php
session_start();
header('Content-Type: application/json');

$conn = new mysqli("localhost", "root", "", "smarthouse");
$conn->set_charset("utf8mb4");

if (!isset($_SESSION['id_house'])) {
    echo json_encode(["success" => false, "error" => "Utilisateur non connecté"]);
    exit();
}

$idHouse = $_SESSION['id_house'];

$sql = "SELECT o.id
        FROM objet_connecte o
        WHERE o.id_house = ? AND o.type = 'arrosage'
        LIMIT 1";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $idHouse);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

if (!$row) {
    echo json_encode(["success" => false, "error" => "Aucun arrosage trouvé"]);
    exit();
}

$idArrosage = $row['id'];

$planning = [];
$stmt = $conn->prepare("SELECT heure FROM planning_arrosage WHERE id_objet_connecte = ? ORDER BY heure");
$stmt->bind_param("i", $idArrosage);
$stmt->execute();
$res = $stmt->get_result();

while ($row = $res->fetch_assoc()) {
    $planning[] = substr($row['heure'], 0, 5); // HH:MM
}

echo json_encode(["success" => true, "planning" => $planning]);

$stmt->close();
$conn->close();
