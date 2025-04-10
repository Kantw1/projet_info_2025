<?php
session_start();
header('Content-Type: application/json');

$conn = new mysqli("localhost", "root", "", "smarthouse");
if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Connexion échouée"]);
    exit();
}

if (!isset($_SESSION['objets_connectes']['Alarme']) || !isset($_SESSION['id']) || !isset($_SESSION['id_house'])) {
    echo json_encode(["success" => false, "error" => "Session invalide"]);
    exit();
}

$idUser = $_SESSION['id'];
$idAlarme = $_SESSION['objets_connectes']['Alarme'][0] ?? null;

if (!$idAlarme) {
    echo json_encode(["success" => false, "error" => "Aucune alarme trouvée"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$isActive = isset($data['isActive']) ? (int)$data['isActive'] : 0;
$isPartial = isset($data['isPartial']) ? (int)$data['isPartial'] : 0;

// ⚠️ Ne met plus à jour la consommation
$stmt = $conn->prepare("
    UPDATE alarme 
    SET est_active = ?, est_partielle = ?, derniere_maj = NOW()
    WHERE id = ?
");
$stmt->bind_param("iii", $isActive, $isPartial, $idAlarme);
$success = $stmt->execute();
$stmt->close();

// Historique
if ($success) {
    $action = $isActive ? ($isPartial ? "Activée (partielle)" : "Activée") : "Désactivée";

    $log = $conn->prepare("
        INSERT INTO historique_alarme (id_alarme, id_user, action)
        VALUES (?, ?, ?)
    ");
    $log->bind_param("iis", $idAlarme, $idUser, $action);
    $log->execute();
    $log->close();
}

echo json_encode(["success" => $success]);
$conn->close();
