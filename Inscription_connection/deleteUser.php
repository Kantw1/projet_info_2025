<?php
session_start(); // Démarrage de la session

// Connexion à la base de données
$host = "localhost";
$dbname = "smarthouse";
$username = "root";
$password = "";

$conn = new mysqli($host, $username, $password, $dbname);

// Vérification de la connexion
if ($conn->connect_error) {
    die("Erreur de connexion : " . $conn->connect_error);
}

// Vérifie si la méthode utilisée est bien POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $lastname = $_POST["nom"] ?? '';
    $firstname = $_POST["prenom"] ?? '';
    $type = $_POST["type"] ?? '';

    // Vérifie que tous les champs sont fournis
    if (empty($lastname) || empty($firstname) || empty($type)) {
        echo json_encode(["success" => false, "message" => "Champs manquants."]);
        exit();
    }

    // Vérifie si l'utilisateur correspond à celui de la session
    if (
        isset($_SESSION["nom"], $_SESSION["prenom"]) &&
        $_SESSION["nom"] === $lastname &&
        $_SESSION["prenom"] === $firstname
    ) {
        echo json_encode(["success" => false, "message" => "Impossible de supprimer l'utilisateur connecté."]);
        exit();
    }

    // Vérifie que l'utilisateur n'est pas un admin
    $stmt = $conn->prepare("SELECT id FROM USERS WHERE lastname = ? AND firstname = ? AND type = ?");
    $stmt->bind_param("sss", $lastname, $firstname, $type);
    $stmt->execute();
    $stmt->store_result();

    // Aucun utilisateur trouvé avec ce nom/prénom/type
    if ($stmt->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "Utilisateur non trouvé."]);
        $stmt->close();
        $conn->close();
        exit();
    }

    // Si l'utilisateur est un admin, interdiction de suppression
    if ($type === "Admin") {
        echo json_encode(["success" => false, "message" => "Impossible de supprimer un administrateur."]);
        $stmt->close();
        $conn->close();
        exit();
    }

    $stmt->close();

    // Suppression de l'utilisateur
    $stmt_delete = $conn->prepare("DELETE FROM USERS WHERE lastname = ? AND firstname = ? AND type = ?");
    $stmt_delete->bind_param("sss", $lastname, $firstname, $type);

    if ($stmt_delete->execute()) {
        echo json_encode(["success" => true, "message" => "Utilisateur supprimé avec succès."]);
    } else {
        echo json_encode(["success" => false, "message" => "Erreur lors de la suppression."]);
    }

    $stmt_delete->close();
    $conn->close();
} else {
    echo json_encode(["success" => false, "message" => "Méthode non autorisée."]);
}
?>
