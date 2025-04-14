<?php
session_start();
header('Content-Type: application/json');

$conn = new mysqli("localhost", "root", "", "smarthouse");
if ($conn->connect_error) {
    echo json_encode(["error" => "Connexion échouée"]);
    exit();
}

if (!isset($_SESSION['id_house'])) {
    echo json_encode(["error" => "Session invalide"]);
    exit();
}

$id_house = $_SESSION['id_house'];

$stmt = $conn->prepare("
    SELECT mois, annee, SUM(conso_litre) AS total_litre
    FROM water
    WHERE id_house = ?
    GROUP BY annee, mois
    ORDER BY annee, FIELD(mois, 'janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre')
");
$stmt->bind_param("i", $id_house);
$stmt->execute();
$result = $stmt->get_result();

$historique = [];
while ($row = $result->fetch_assoc()) {
    $label = ucfirst($row['mois']) . ' ' . $row['annee'];
    $historique[] = [
        'mois' => $label,
        'litres' => round($row['total_litre'], 0)
    ];
}

$stmt->close();
$conn->close();

echo json_encode($historique);
