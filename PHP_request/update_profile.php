<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

// Connexion à la BDD
$host = "localhost";
$dbname = "smarthouse";
$username = "root";
$password = "";

$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'error' => 'Erreur de connexion à la base de données.']);
    exit();
}

// Vérifie si l'utilisateur est connecté
if (!isset($_SESSION['id'])) {
    echo json_encode(['success' => false, 'error' => 'Utilisateur non connecté.']);
    exit();
}

// Récupère et décode les données JSON envoyées
$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);

// Validation basique des champs
if (
    !isset($data['lastname']) || empty(trim($data['lastname'])) ||
    !isset($data['firstname']) || empty(trim($data['firstname'])) ||
    !isset($data['mail']) || empty(trim($data['mail']))
) {
    echo json_encode(['success' => false, 'error' => 'Tous les champs sont obligatoires.']);
    exit();
}

$id        = $_SESSION['id'];
$lastname  = trim($data['lastname']);
$firstname = trim($data['firstname']);
$mail      = trim($data['mail']);

// Requête de mise à jour
$stmt = $conn->prepare("UPDATE users SET lastname = ?, firstname = ?, mail = ? WHERE id = ?");
$stmt->bind_param("sssi", $lastname, $firstname, $mail, $id);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Erreur lors de la mise à jour.']);
}

$stmt->close();
$conn->close();
?>
