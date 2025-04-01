<?php
session_start();

// Connexion à la base de données
$host = "localhost";
$dbname = "smarthouse";
$username = "root";
$password = "";

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Erreur de connexion : " . $conn->connect_error);
}

// Vérifie si l'utilisateur est connecté
if (isset($_SESSION['id'])) {
    $userId = $_SESSION['id'];

    // Récupération des infos de l'utilisateur
    $stmt = $conn->prepare("SELECT type, point FROM USERS WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $stmt->bind_result($type, $points);
    $stmt->fetch();
    $stmt->close();

    // Vérifie conditions
    if ($type === "Simple utilisateur" && $points >= 10) {
        $updateStmt = $conn->prepare("UPDATE USERS SET type = 'Complexe utilisateur' WHERE id = ?");
        $updateStmt->bind_param("i", $userId);
        $updateStmt->execute();
        $updateStmt->close();
    }
}

$conn->close();
?>
