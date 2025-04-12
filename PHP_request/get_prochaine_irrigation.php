<?php
session_start();
header('Content-Type: application/json');

$conn = new mysqli("localhost", "root", "", "smarthouse");
$conn->set_charset("utf8mb4");

// Vérifie que l'objet Arrosage est bien présent
if (!isset($_SESSION['objets_connectes']['Arrosage'])) {
    echo json_encode(["success" => false, "error" => "Aucun arrosage trouvé dans la session"]);
    exit();
}

$idArrosage = $_SESSION['objets_connectes']['Arrosage'][0];

// Récupérer toutes les heures programmées
$stmt = $conn->prepare("SELECT heure FROM planning_arrosage WHERE id_objet_connecte = ? ORDER BY heure ASC");
$stmt->bind_param("i", $idArrosage);
$stmt->execute();
$result = $stmt->get_result();

$heures = [];
while ($row = $result->fetch_assoc()) {
    $heures[] = $row['heure']; // format : "HH:MM:SS"
}

if (empty($heures)) {
    echo json_encode(["success" => false, "error" => "Aucune heure d’irrigation programmée"]);
    exit();
}

date_default_timezone_set('Europe/Paris');
$now = new DateTime();
$aujourdHui = $now->format('Y-m-d');
$demain = (clone $now)->modify('+1 day')->format('Y-m-d');

$trouvee = null;

foreach ($heures as $heure) {
    $dt = new DateTime("$aujourdHui $heure");
    if ($dt > $now) {
        $trouvee = $dt;
        break;
    }
}

if (!$trouvee) {
    // Si aucune heure aujourd’hui n’est à venir → on prend la première demain
    $trouvee = new DateTime("$demain {$heures[0]}");
}

echo json_encode([
    "success" => true,
    "prochaineIrrigation" => $trouvee->format('d/m/Y H:i')
]);

$stmt->close();
$conn->close();
