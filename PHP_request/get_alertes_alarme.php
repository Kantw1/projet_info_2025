<?php
session_start();
header('Content-Type: application/json');

$conn = new mysqli("localhost", "root", "", "smarthouse");
if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Connexion échouée"]);
    exit();
}

if (!isset($_SESSION['objets_connectes']['Alarme'])) {
    echo json_encode(["success" => false, "error" => "Session invalide"]);
    exit();
}

$idAlarme = $_SESSION['objets_connectes']['Alarme'][0];

$sql = "
  SELECT a.date_alerte, a.message, a.criticite, c.lieu AS capteur
  FROM alerte_intrusion a
  JOIN capteur c ON a.id_capteur = c.id
  WHERE a.id_alarme = ?
  ORDER BY a.date_alerte DESC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $idAlarme);
$stmt->execute();
$result = $stmt->get_result();

$alertes = [];
while ($row = $result->fetch_assoc()) {
    $alertes[] = [
        "date" => $row['date_alerte'],
        "status" => $row['criticite'],
        "capteur" => $row['capteur'],
        "message" => $row['message']
    ];
}

echo json_encode(["success" => true, "alertes" => $alertes]);

$stmt->close();
$conn->close();
