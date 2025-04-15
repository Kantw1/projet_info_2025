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

    // Récupération des infos de l'utilisateur (type, points, autorisation)
    $stmt = $conn->prepare("SELECT type, point, autorisationAdmin FROM USERS WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $stmt->bind_result($type, $points, $autorisationAdmin);
    $stmt->fetch();
    $stmt->close();

    // ✅ Passage de Simple → Complexe
    if ($type === "Simple utilisateur" && $points >= 300) {
        $newType = 'Complexe utilisateur';
        $updateStmt = $conn->prepare("UPDATE USERS SET type = ? WHERE id = ?");
        $updateStmt->bind_param("si", $newType, $userId);
        $updateStmt->execute();
        $updateStmt->close();

        $_SESSION['type'] = $newType; // 🔄 Mise à jour de la session
    }

<<<<<<< HEAD
    // ✅ Passage de Complexe → Admin (avec autorisation) a modifier
    elseif ($type === "Complexe utilisateur" && $points >= 20 && $autorisationAdmin === "OUI") {
=======
    // ✅ Passage de Complexe → Admin (avec autorisation)
    elseif ($type === "Complexe utilisateur" && $points >= 500 && $autorisationAdmin === "OUI") {
>>>>>>> 41ad08be4d76df951fe99c02938dd7a01254a94d
        $newType = 'admin';
        $updateStmt = $conn->prepare("UPDATE USERS SET type = ? WHERE id = ?");
        $updateStmt->bind_param("si", $newType, $userId);
        $updateStmt->execute();
        $updateStmt->close();

        $_SESSION['type'] = $newType; // 🔄 Mise à jour de la session
    }
}

$conn->close();
?>
