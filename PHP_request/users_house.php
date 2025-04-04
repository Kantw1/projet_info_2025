<?php
session_start(); // Démarrer la session

// Paramètres de connexion à la base de données
$host = "localhost";
$dbname = "smarthouse";
$username = "root";
$password = "";

$conn = new mysqli($host, $username, $password, $dbname);

// Vérification de la connexion
if ($conn->connect_error) {
    die("Erreur de connexion : " . $conn->connect_error);
}

// Vérification de la présence de id_house en session
if (isset($_SESSION['id_house'])) {
    $id_house = $_SESSION['id_house'];

    // Préparation de la requête avec la nouvelle colonne
    $stmt = $conn->prepare("SELECT lastname, firstname, type, point, autorisationAdmin FROM USERS WHERE id_house = ?");
    $stmt->bind_param("i", $id_house);

    $stmt->execute();
    $result = $stmt->get_result();

    $users = array();

    while ($row = $result->fetch_assoc()) {
        $users[] = array(
            'lastname' => $row['lastname'],
            'firstname' => $row['firstname'],
            'type' => $row['type'],
            'point' => $row['point'],
            'autorisationAdmin' => $row['autorisationAdmin']
        );
    }

    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($users);

    $stmt->close();
} else {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'id_house non défini en session']);
}

$conn->close();
?>
