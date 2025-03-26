<?php
session_start(); // Démarrer la session

// Connexion à la base de données
$host = "localhost";
$dbname = "smarthouse";
$username = "root";
$password = "";

$conn = new mysqli($host, $username, $password, $dbname);

// Vérification de la connexion
if ($conn->connect_error) {
    die(json_encode(['error' => 'Erreur de connexion : ' . $conn->connect_error]));
}

header('Content-Type: application/json; charset=utf-8');

// Vérifie que l'id est présent dans la session
if (isset($_SESSION['id'])) {
    $id = $_SESSION['id'];

    // Préparation de la requête pour récupérer les infos utilisateur
    $stmt = $conn->prepare("SELECT lastname, firstname, mail, type FROM users WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();

    // Récupération des résultats
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        // Affectation des valeurs récupérées
        $lastname = $user['lastname'];
        $firstname = $user['firstname'];
        $mail = $user['mail'];
        $type = $user['type'];

        $userData = array(
            'last_name' => $lastname,
            'first_name' => $firstname,
            'mail' => $mail,
            'type' => $type
        );

        // Convertir le tableau en format JSON et le renvoyer
        echo json_encode($userData);

    } else {
        echo json_encode(['error' => 'Aucun utilisateur trouvé pour cet ID.']);
    }

    $stmt->close();

} else {
    echo json_encode(['error' => 'ID utilisateur manquant dans la session.']);
}

$conn->close();
?>
