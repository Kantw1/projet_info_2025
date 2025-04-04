<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

$host = "localhost";
$dbname = "smarthouse";
$username = "root";
$password = "";

$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Connexion échouée']);
    exit();
}

// Récupération des infos depuis le formulaire
$nom = $_POST['nom'];
$prenom = $_POST['prenom'];
$autorisation = $_POST['autorisationAdmin'];

// Récupération de l'id de l'utilisateur ciblé
$idTarget = getUserId($conn, $nom, $prenom);
if (!$idTarget) {
    echo json_encode(['success' => false, 'message' => 'Utilisateur introuvable']);
    exit();
}

// Mise à jour de l'autorisation
$stmt = $conn->prepare("UPDATE USERS SET autorisationAdmin = ? WHERE id = ?");
$stmt->bind_param("si", $autorisation, $idTarget);

if ($stmt->execute()) {
    checkUserType($conn, $idTarget); // ✅ Appel direct de la fonction logique
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Erreur SQL']);
}

$stmt->close();
$conn->close();


// 🔁 Récupère l'ID d'un utilisateur via son nom, prénom, et maison
function getUserId($conn, $nom, $prenom) {
    $id_house = $_SESSION['id_house'];
    $stmt = $conn->prepare("SELECT id FROM USERS WHERE lastname = ? AND firstname = ? AND id_house = ?");
    $stmt->bind_param("ssi", $nom, $prenom, $id_house);
    $stmt->execute();
    $stmt->bind_result($id);
    $stmt->fetch();
    $stmt->close();
    return $id ?? null;
}

// 🔁 Fonction propre de vérification et mise à jour du type utilisateur
function checkUserType($conn, $userId) {
    $stmt = $conn->prepare("SELECT type, point, autorisationAdmin FROM USERS WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $stmt->bind_result($type, $points, $autorisationAdmin);
    $stmt->fetch();
    $stmt->close();

    // Promotion si conditions remplies
    if ($type === "Simple utilisateur" && $points >= 10) {
        $newType = "Complexe utilisateur";
    } elseif ($type === "Complexe utilisateur" && $points >= 20 && $autorisationAdmin === "OUI") {
        $newType = "admin";
    } else {
        return; // Pas de promotion
    }

    $stmt = $conn->prepare("UPDATE USERS SET type = ? WHERE id = ?");
    $stmt->bind_param("si", $newType, $userId);
    $stmt->execute();
    $stmt->close();
}
?>
