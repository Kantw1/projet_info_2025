<?php
session_start();
$conn = new mysqli("localhost", "root", "", "smarthouse");
$conn->set_charset("utf8mb4");

if (!isset($_SESSION['id_house'])) {
    echo json_encode(["success" => false, "error" => "Maison non définie"]);
    exit();
}

$idHouse = $_SESSION['id_house'];
$_SESSION['objets_connectes'] = []; // réinitialiser

$sql = "SELECT id, type FROM objet_connecte WHERE id_house = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $idHouse);
$stmt->execute();
$res = $stmt->get_result();

while ($row = $res->fetch_assoc()) {
    $type = ucfirst(strtolower($row['type'])); // ex: 'arrosage' → 'Arrosage'
    $_SESSION['objets_connectes'][$type] = $row['id'];
}

echo json_encode(["success" => true, "objets_connectes" => $_SESSION['objets_connectes']]);
