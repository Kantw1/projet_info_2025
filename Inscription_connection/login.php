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

// Vérification si la requête est bien en POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $mail = $_POST["email"];
    $password = $_POST["password"];

    // Récupération des informations utilisateur, y compris id_house
    $stmt = $conn->prepare("SELECT id, lastname, firstname, password, type, id_house FROM USERS WHERE mail = ?");
    $stmt->bind_param("s", $mail);
    $stmt->execute();
    $stmt->store_result();

    // Vérification si l'utilisateur existe
    if ($stmt->num_rows > 0) {
        $stmt->bind_result($id, $lastname, $firstname, $hashed_password, $type, $id_house);
        $stmt->fetch();

        // Vérification du mot de passe
        if (password_verify($password, $hashed_password)) {
            // Stockage des informations en session
            $_SESSION['id'] = $id;
            $_SESSION['id_house'] = $id_house;
            $_SESSION['type'] = $type;


            // ➕ Incrémenter les points
            $updateStmt = $conn->prepare("UPDATE USERS SET point = point + 1 WHERE id = ?");
            $updateStmt->bind_param("i", $id);
            $updateStmt->execute();
            $updateStmt->close();

            require("../Points/check_user_type.php");

            // Rediriger l'utilisateur selon son type
            header("Location: ../AdminPage/admin.html");
            exit();
        } else {
            header("Location: connection.html?error=Mot de passe incorrect !");
            exit();
        }
    } else {
        header("Location: connection.html?error=Email introuvable !");
        exit();
    }

    $stmt->close();
    $conn->close();
} else {
    echo "Méthode non autorisée.";
}
?>
