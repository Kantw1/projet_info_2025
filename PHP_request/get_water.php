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

// Traduction fiable du mois
$mois_en = strtolower(date('F'));
$traductions = [
    'january' => 'janvier', 'february' => 'février', 'march' => 'mars',
    'april' => 'avril', 'may' => 'mai', 'june' => 'juin',
    'july' => 'juillet', 'august' => 'août', 'september' => 'septembre',
    'october' => 'octobre', 'november' => 'novembre', 'december' => 'décembre'
];
$mois = $traductions[$mois_en];
$annee = date('Y');

$stmt = $conn->prepare("
    SELECT type_objet, conso_litre
    FROM water
    WHERE id_house = ? AND mois = ? AND annee = ?
");
$stmt->bind_param("isi", $id_house, $mois, $annee);
$stmt->execute();
$result = $stmt->get_result();

$donnees = [];
while ($row = $result->fetch_assoc()) {
    $donnees[] = [
        'nom' => $row['type_objet'],
        'conso' => number_format($row['conso_litre'], 0) . ' L'
    ];
}

$stmt->close();
$conn->close();

echo json_encode($donnees);
