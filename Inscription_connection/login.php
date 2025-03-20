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

// Vérification si la requête est bien en POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $mail = $_POST["email"];
    $password = $_POST["password"];

    // Vérification si l'email existe en base
    $stmt = $conn->prepare("SELECT id, lastname, firstname, password, type FROM USERS WHERE mail = ?");
    $stmt->bind_param("s", $mail);
    $stmt->execute();
    $stmt->store_result();

    // Si l'utilisateur existe
    if ($stmt->num_rows > 0) {
        $stmt->bind_result($id, $lastname, $firstname, $hashed_password, $type);
        $stmt->fetch();

        // Vérification du mot de passe
        if (password_verify($password, $hashed_password)) {
            // Stocker les informations de l'utilisateur en session
            $_SESSION['id'] = $id;
            $_SESSION['lastname'] = $lastname;
            $_SESSION['firstname'] = $firstname;
            $_SESSION['mail'] = $mail;
            $_SESSION['type'] = $type;

            // Rediriger l'utilisateur selon son type
            if ($type == 'admin') {
                header("Location: ../AdminPage/admin.html");
            } else {
                header("Location: ../UserPage/user.html");
            }
            exit();
        } else {
            // Mot de passe incorrect
            header("Location: connection.html?error=Mot de passe incorrect !");
            exit();
        }
    } else {
        // Email non trouvé
        header("Location: connection.html?error=Email introuvable !");
        exit();
    }

    // Fermeture des connexions
    $stmt->close();
    $conn->close();
} else {
    echo "Méthode non autorisée.";
}
?>
