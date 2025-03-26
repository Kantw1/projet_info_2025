<?php
session_start(); // Ouvre une session PHP

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
        header("Location: inscription.html?error=Email déjà utilisé !");
        exit();
    } else {
        // Création d'une maison dans la table house
        $stmt = $conn->prepare("INSERT INTO house () VALUES ()");
        if ($stmt->execute()) {
            // Récupération directe de l'id généré pour la maison
            $id_house = $conn->insert_id;

            // Hachage du mot de passe
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);

            // Requête SQL pour insérer l'utilisateur avec l'id_house
            $stmt = $conn->prepare("INSERT INTO USERS (lastname, firstname, mail, password, type, id_house) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("sssssi", $lastname, $firstname, $mail, $hashed_password, $type, $id_house);

            if ($stmt->execute()) {
                // Stocker les informations dans la session
                $_SESSION['id'] = $conn->insert_id;
                $_SESSION['id_house'] = $id_house;  // ID maison créée juste avant
                
                header("Location: ../AdminPage/admin.html?success=1");
                exit();
            } else {
                header("Location: inscription.html?error=Erreur lors de l'inscription utilisateur!");
                exit();
            }

        } else {
            header("Location: inscription.html?error=Erreur lors de la création de la maison!");
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
