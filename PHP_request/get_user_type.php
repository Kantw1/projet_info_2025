<?php
session_start();
header('Content-Type: application/json');

$conn = new mysqli("localhost", "root", "", "smarthouse");
$conn->set_charset("utf8mb4");

// 🔒 Vérification de la session utilisateur
if (!isset($_SESSION['id'])) {
    echo json_encode(["success" => false, "error" => "Utilisateur non connecté"]);
    exit();
}

$id = $_SESSION['id'];

// 🔎 Récupérer le type d'utilisateur depuis la base
$stmt = $conn->prepare("SELECT type FROM users WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
$data = $result->fetch_assoc();
$stmt->close();
$conn->close();

if (!$data) {
    echo json_encode(["success" => false, "error" => "Utilisateur introuvable"]);
    exit();
}

// ✅ Renvoie le type
echo json_encode([
    "success" => true,
    "type" => $data['type']
]);
