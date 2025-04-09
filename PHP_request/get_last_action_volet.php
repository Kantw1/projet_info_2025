<?php
session_start();

// Connexion BDD
$host = "localhost";
$dbname = "smarthouse";
$username = "root";
$password = "";
$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Connexion échouée"]);
    exit();
}

// Vérifie que la maison est bien en session
$id_house = $_SESSION['id_house'] ?? null;
if (!$id_house) {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Session invalide"]);
    exit();
}

// Requête : dernière action + utilisateur
$sql = "
SELECT hv.action, hv.date_heure, u.firstname, u.lastname
FROM historique_volet_roulant hv
JOIN objet_connecte o ON hv.id_objet_connecte = o.id
JOIN USERS u ON hv.id_user = u.id
WHERE o.id_house = ?
ORDER BY hv.date_heure DESC
LIMIT 1
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id_house);
$stmt->execute();
$result = $stmt->get_result();
$data = $result->fetch_assoc();

if ($data) {
    echo json_encode([
        "success" => true,
        "action" => $data['action'],
        "date_heure" => $data['date_heure'],
        "user" => $data['firstname'] . ' ' . $data['lastname']
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Aucune action trouvée"]);
}
