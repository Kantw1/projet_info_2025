<?php
session_start();
header('Content-Type: application/json');

$conn = new mysqli("localhost", "root", "", "smarthouse");
$conn->set_charset("utf8mb4");

// ✅ Vérifie la présence de l'arrosage en session
if (!isset($_SESSION['objets_connectes']['Arrosage'])) {
    echo json_encode(["success" => false, "error" => "Aucun arrosage associé à cette session"]);
    exit();
}

$idArrosage = $_SESSION['objets_connectes']['Arrosage'][0]; // ou [0] si tableau

// 📦 Récupération de l’historique
$historique = [];
$stmt = $conn->prepare("
    SELECT date_irrigation, duree_minutes 
    FROM historique_arrosage 
    WHERE id_objet_connecte = ? 
    ORDER BY date_irrigation DESC 
    LIMIT 10
");
$stmt->bind_param("i", $idArrosage);
$stmt->execute();
$res = $stmt->get_result();

while ($row = $res->fetch_assoc()) {
    $historique[] = [
        "date" => date("d/m/Y H:i", strtotime($row['date_irrigation'])),
        "duree" => $row['duree_minutes'] . " min"
    ];
}

echo json_encode(["success" => true, "historique" => $historique]);

$stmt->close();
$conn->close();
