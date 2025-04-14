<?php
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = $_POST['email'];
    $token = bin2hex(random_bytes(32));
    $expiration = time() + 3600;

    $conn = new mysqli("localhost", "root", "", "ma_base");
    $stmt = $conn->prepare("INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)");
    $stmt->bind_param("ssi", $email, $token, $expiration);
    $stmt->execute();

    $resetLink = "http://localhost/projet_info_2025/ForgotMyPassword/reset_password_form.php?token=$token";
    $subject = "Réinitialisation de votre mot de passe";
    $message = "Cliquez ici pour réinitialiser : $resetLink";
    $headers = "From: noreply@votresite.com";

    if (mail($email, $subject, $message, $headers)) {
        echo "OK";
    } else {
        echo "Erreur d'envoi";
    }
}
?>
