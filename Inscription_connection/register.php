<?php
session_start(); // Ouvre une session PHP

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

// Vérification si la requête est bien en POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $lastname = $_POST["nom"];
    $firstname = $_POST["prenom"];
    $mail = $_POST["email"];
    $password = $_POST["password"];
    $type = 'admin';

    // Vérification si l'email existe déjà
    $stmt = $conn->prepare("SELECT id FROM USERS WHERE mail = ?");
    $stmt->bind_param("s", $mail);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        // Redirection vers inscription.html avec un message d'erreur
        header("Location: inscription.html?error=Email déjà utilisé !");
        exit();
    } else {
        // Hachage du mot de passe pour la sécurité
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        // Requête SQL pour insérer l'utilisateur
        $stmt = $conn->prepare("INSERT INTO USERS (lastname, firstname, mail, password, type) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssss", $lastname, $firstname, $mail, $hashed_password, $type);

        if ($stmt->execute()) {
            // Stocker les informations de l'utilisateur dans la session
            $_SESSION['id'] = $id;
            $_SESSION['lastname'] = $lastname;
            $_SESSION['firstname'] = $firstname;
            $_SESSION['mail'] = $mail;
            $_SESSION['type'] = $type;

            // Redirection vers admin.html après inscription réussie
            header("Location: ../AdminPage/admin.html?success=1");
            exit();
        } else {
            header("Location: inscription.html?error=Erreur lors de l'inscription !");
            exit();
        }
    }

    // Fermeture des connexions
    $stmt->close();
    $conn->close();
} else {
    echo "Méthode non autorisée.";
}
?>
