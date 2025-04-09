<?php
session_start();
$host = "localhost";
$dbname = "smarthouse";
$username = "root";
$password = "";

$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["error" => "Connexion BDD échouée"]);
    exit();
}

$id_house = $_SESSION['id_house'] ?? null;
if (!$id_house) {
    echo json_encode(["error" => "Session invalide"]);
    exit();
}

$sql = "
SELECT SUM(hv.consommation_electricite) AS total
FROM historique_volet_roulant hv
JOIN objet_connecte o ON hv.id_objet_connecte = o.id
WHERE o.id_house = ?
AND MONTH(hv.date_heure) = MONTH(NOW())
AND YEAR(hv.date_heure) = YEAR(NOW())
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id_house);
$stmt->execute();
$result = $stmt->get_result();
$data = $result->fetch_assoc();

echo json_encode(["total" => round($data['total'] ?? 0, 2)]);
