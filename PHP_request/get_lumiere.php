<?php
session_start();
header('Content-Type: application/json');

$conn = new mysqli("localhost", "root", "", "smarthouse");
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Erreur de connexion à la base de données"]);
    exit();
}

if (!isset($_SESSION['id_house'])) {
    echo json_encode(["success" => false, "error" => "Utilisateur non connecté"]);
    exit();
}

$idHouse = $_SESSION['id_house'];

// Récupération des lumières pour cette maison
$sql = "SELECT l.id_objet_connecte, l.nom, l.piece, l.etat, l.intensite, l.couleur, l.connectivite 
        FROM lumiere l
        JOIN objet_connecte o ON l.id_objet_connecte = o.id
        WHERE o.id_house = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $idHouse);
$stmt->execute();
$result = $stmt->get_result();

$lumieres = [];
while ($row = $result->fetch_assoc()) {
    $lumieres[] = $row;
}

echo json_encode(["success" => true, "lumieres" => $lumieres]);

$stmt->close();
$conn->close();
?>
