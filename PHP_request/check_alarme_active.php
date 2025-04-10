<?php
session_start();
header('Content-Type: application/json');

// Connexion BDD
$conn = new mysqli("localhost", "root", "", "smarthouse");
if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Connexion échouée"]);
    exit();
}

// Vérifie la session
if (!isset($_SESSION['objets_connectes']['Alarme']) || !isset($_SESSION['id'])) {
    echo json_encode(["success" => false, "error" => "Session invalide"]);
    exit();
}

// ID alarme récupéré depuis la session
$idAlarme = $_SESSION['objets_connectes']['Alarme'][0] ?? null;
if (!$idAlarme) {
    echo json_encode(["success" => false, "error" => "ID alarme manquant"]);
    exit();
}

// Requête
$stmt = $conn->prepare("SELECT est_active FROM alarme WHERE id = ?");
$stmt->bind_param("i", $idAlarme);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $row = $result->fetch_assoc()) {
    echo json_encode([
        "success" => true,
        "isActive" => (bool)$row['est_active']
    ]);
} else {
    echo json_encode(["success" => false, "error" => "Alarme introuvable"]);
}

$stmt->close();
$conn->close();
