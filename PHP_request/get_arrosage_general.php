<?php
session_start();
header('Content-Type: application/json');
$conn = new mysqli("localhost", "root", "", "smarthouse");
$conn->set_charset("utf8mb4");

// 🔐 Vérification session
if (!isset($_SESSION['objets_connectes']['Arrosage'])) {
    echo json_encode(["success" => false, "error" => "Aucun arrosage associé à cette session"]);
    exit();
}

// 🔄 Récupération de l'ID d'arrosage depuis la session
$idArrosage = $_SESSION['objets_connectes']['Arrosage']; // si un seul objet
// Ou bien : $idArrosage = $_SESSION['objets_connectes']['Arrosage'][0]; si c'est un tableau

// 📦 Requête sur la table arrosage
$sql = "SELECT actif, humidite_sol FROM arrosage WHERE id_objet_connecte = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $idArrosage);
$stmt->execute();
$result = $stmt->get_result();
$data = $result->fetch_assoc();

if (!$data) {
    echo json_encode(["success" => false, "error" => "Aucune donnée d’arrosage trouvée"]);
    exit();
}

echo json_encode([
    "success" => true,
    "id_arrosage" => $idArrosage,
    "actif" => (bool)$data['actif'],
    "humiditeSol" => (int)$data['humidite_sol']
]);

$stmt->close();
$conn->close();
