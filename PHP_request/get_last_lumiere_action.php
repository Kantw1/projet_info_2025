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

$sql = "
SELECT h.action, h.date_heure, u.lastname, u.firstname
FROM historique_lumiere h
JOIN objet_connecte o ON h.id_objet_connecte = o.id
JOIN users u ON h.id_user = u.id
WHERE o.id_house = ?
ORDER BY h.date_heure DESC
LIMIT 1
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $idHouse);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

if ($row) {
    $nomComplet = $row['firstname'] . ' ' . $row['lastname'];
    echo json_encode([
        "success" => true,
        "action" => $row['action'],
        "utilisateur" => $nomComplet,
        "horodatage" => $row['date_heure']
    ]);
} else {
    echo json_encode([
        "success" => true,
        "action" => "Aucune action récente",
        "utilisateur" => "",
        "horodatage" => ""
    ]);
}

$stmt->close();
$conn->close();
