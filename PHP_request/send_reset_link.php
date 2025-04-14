<?php
// Vider tout avant tout
ob_start();
ob_clean();
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 1);
error_reporting(E_ALL);
session_start();
date_default_timezone_set('Europe/Paris');


// MailHog config (SMTP sur port 1025)
ini_set('SMTP', 'localhost');
ini_set('smtp_port', 1025);
ini_set('sendmail_from', 'admin@smarthouse.local');

// Connexion à la base
try {
    $pdo = new PDO("mysql:host=localhost;dbname=smarthouse;charset=utf8mb4", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => "Erreur de connexion BDD"]);
    exit;
}

// Lecture JSON brut
$raw = file_get_contents("php://input");
$input = json_decode($raw, true);

if (!$input || !isset($input['email'])) {
    echo json_encode(['success' => false, 'message' => "Format JSON invalide"]);
    exit;
}

$email = $input['email'];

// Vérification email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => "Email non valide"]);
    exit;
}

// Vérifie si utilisateur existe
$stmt = $pdo->prepare("SELECT id FROM users WHERE mail = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user) {
    echo json_encode(['success' => false, 'message' => "Email inconnu"]);
    exit;
}

// Génère le token
$token = bin2hex(random_bytes(32));
$expiration = date('Y-m-d H:i:s', time() + 3600); // expire dans 1h

$stmt = $pdo->prepare("INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)");
$stmt->execute([$user['id'], $token, $expiration]);

// Crée le lien
$lien = "http://localhost/ProjetDevWeb/projet_info_2025/ForgotMyPassword/resetByToken.html?token=$token";

// Mail
$sujet = "Réinitialisation du mot de passe";
$msg = "Voici votre lien de réinitialisation : $lien\nCe lien expire dans 1 heure.";
$headers = "From: admin@smarthouse.local";

if (mail($email, $sujet, $msg, $headers)) {
    echo json_encode(['success' => true, 'message' => "Mail envoyé"]);
} else {
    echo json_encode(['success' => false, 'message' => "Échec de l'envoi du mail"]);
}
?>
