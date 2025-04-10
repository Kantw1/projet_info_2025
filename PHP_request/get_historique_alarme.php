<?php
session_start();
header('Content-Type: application/json');

$conn = new mysqli("localhost", "root", "", "smarthouse");
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Connexion échouée"]);
    exit();
}

if (!isset($_SESSION['objets_connectes']['Alarme']) || !isset($_SESSION['id'])) {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Session invalide"]);
    exit();
}

$idAlarme = $_SESSION['objets_connectes']['Alarme'][0];

$sql = "
  SELECT h.date_action, h.action, CONCAT(u.firstname, ' ', u.lastname) AS user
  FROM historique_alarme h
  JOIN users u ON h.id_user = u.id
  WHERE h.id_alarme = ?
  ORDER BY h.date_action DESC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $idAlarme);
$stmt->execute();
$result = $stmt->get_result();

$historique = [];
while ($row = $result->fetch_assoc()) {
    $historique[] = [
        "date" => $row['date_action'],
        "status" => $row['action'],
        "user" => $row['user']
    ];
}

echo json_encode(["success" => true, "historique" => $historique], JSON_UNESCAPED_UNICODE);

$stmt->close();
$conn->close();
