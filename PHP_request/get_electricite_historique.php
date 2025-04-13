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

// Agréger conso par mois + année
$stmt = $conn->prepare("
    SELECT mois, annee, SUM(conso_kwh) AS total_kwh
    FROM electricity
    WHERE id_house = ?
    GROUP BY annee, mois
    ORDER BY annee ASC
");
$stmt->bind_param("i", $id_house);
$stmt->execute();
$result = $stmt->get_result();

$historique = [];
while ($row = $result->fetch_assoc()) {
    $label = ucfirst($row['mois']) . ' ' . $row['annee'];
    $historique[] = [
        'mois' => $label,
        'kwh' => round(abs($row['total_kwh']), 1)
    ];
}

$stmt->close();
$conn->close();

echo json_encode($historique);
