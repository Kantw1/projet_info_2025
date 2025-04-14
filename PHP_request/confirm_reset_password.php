<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);
session_start();

// Connexion BDD
try {
    $pdo = new PDO("mysql:host=localhost;dbname=smarthouse;charset=utf8mb4", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => "Erreur de connexion BDD"]);
    exit;
}

// Lecture JSON
$input = json_decode(file_get_contents("php://input"), true);
$token = $input['token'] ?? '';
$newPassword = $input['newPassword'] ?? '';

// Vérification des champs
if (empty($token) || empty($newPassword)) {
    echo json_encode(['success' => false, 'message' => "Données manquantes."]);
    exit;
}

// Vérifie la validité du token
$stmt = $pdo->prepare("SELECT prt.user_id, u.mail FROM password_reset_tokens prt
                       INNER JOIN users u ON u.id = prt.user_id
                       WHERE prt.token = ? AND prt.expires_at >= NOW()");
$stmt->execute([$token]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$row) {
    echo json_encode(['success' => false, 'message' => "Lien invalide ou expiré."]);
    exit;
}

// Mise à jour du mot de passe
$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
$update = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
$update->execute([$hashedPassword, $row['user_id']]);

// Supprime le token
$pdo->prepare("DELETE FROM password_reset_tokens WHERE token = ?")->execute([$token]);

echo json_encode(['success' => true, 'message' => "Mot de passe réinitialisé avec succès."]);
