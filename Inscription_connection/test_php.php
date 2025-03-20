<?php
$host = "localhost";
$dbname = "smarthouse";
$username = "root";
$password = "";

// Connexion à MySQL
$conn = new mysqli($host, $username, $password, $dbname);

if (!$conn) {
    echo "Échec de la connexion : " ;
} else {
    echo "Connexion réussie à la base de données !";
}
?>