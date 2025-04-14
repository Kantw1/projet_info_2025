<?php
session_start();
header('Content-Type: application/json');

$conn = new mysqli("localhost", "root", "", "smarthouse");
$conn->set_charset("utf8mb4");

// 🔒 Vérification session
if (!isset($_SESSION['id_house'])) {
    echo json_encode(["success" => false, "error" => "Maison non définie"]);
    exit();
}

$idHouse = $_SESSION['id_house'];

// 📦 Requête pour récupérer les types uniques d’objets sauf 'capteur'
$sql = "SELECT DISTINCT type FROM objet_connecte WHERE id_house = ? AND type != 'Capteur'";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $idHouse);
$stmt->execute();
$result = $stmt->get_result();

$types = [];
while ($row = $result->fetch_assoc()) {
    $types[] = $row['type'];
}

$stmt->close();
$conn->close();

echo json_encode(["success" => true, "types" => $types]);
