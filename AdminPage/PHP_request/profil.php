<?php
session_start(); // Démarrer la session

// Paramètres de connexion à la base de données
$host = "localhost"; // ou l'adresse de ton serveur
$dbname = "smarthouse"; // Nom de la base de données
$username = "root";  // Nom d'utilisateur MySQL
$password = "";      // Mot de passe MySQL (laisser vide pour XAMPP)

$conn = new mysqli($host, $username, $password, $dbname);

// Vérification de la connexion
if ($conn->connect_error) {
    die("Erreur de connexion : " . $conn->connect_error);
}
?>