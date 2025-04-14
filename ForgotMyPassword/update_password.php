<?php
$token = $_POST['token'];
$newPassword = password_hash($_POST['password'], PASSWORD_DEFAULT);

$conn = new mysqli("localhost", "root", "", "ma_base");

// Vérifier si le token est valide
$stmt = $conn->prepare("SELECT email FROM password_resets WHERE token = ? AND expires_at > ?");
$now = time();
$stmt->bind_param("si", $token, $now);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    $email = $row['email'];

    // Mettre à jour le mot de passe
    $stmt = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
    $stmt->bind_param("ss", $newPassword, $email);
    $stmt->execute();

    echo "✅ Mot de passe mis à jour.";
} else {
    echo "❌ Lien invalide ou expiré.";
}
?>
