<?php
session_start();

$conn = new mysqli("localhost", "root", "", "smarthouse");
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Connexion échouée"]);
    exit();
}

// Vérifie que les volets sont connectés dans la session
if (!isset($_SESSION['objets_connectes']['VoletRoulant']) || empty($_SESSION['objets_connectes']['VoletRoulant'])) {
    echo json_encode(["success" => false, "error" => "Aucun volet roulant dans la session"]);
    exit();
}

$voletIds = $_SESSION['objets_connectes']['VoletRoulant'];
$placeholders = implode(',', array_fill(0, count($voletIds), '?'));

// Met à jour tous les volets pour les fermer
$sql = "UPDATE volet_roulant 
        SET ouverture = 0, statut = 'fermé' 
        WHERE id_objet_connecte IN ($placeholders)";
$stmt = $conn->prepare($sql);
$stmt->bind_param(str_repeat('i', count($voletIds)), ...$voletIds);
$stmt->execute();

// Vérifie si des lignes ont été affectées
if ($stmt->affected_rows > 0) {
    // Enregistre l'action dans l'historique pour chaque volet
    $idUser = $_SESSION['id'] ?? null;
    $action = 'Fermeture automatique (mode sécurité)';
    foreach ($voletIds as $voletId) {
        $stmt = $conn->prepare("
            INSERT INTO historique_volet_roulant (id_objet_connecte, id_user, date_heure, ouverture, consommation_electricite, action)
            VALUES (?, ?, NOW(), 0, 0.15, ?)
        ");
        $stmt->bind_param("iiis", $voletId, $idUser, $action);
        $stmt->execute();
    }

    echo json_encode(["success" => true, "updated" => $stmt->affected_rows]);
} else {
    echo json_encode(["success" => false, "message" => "Aucune mise à jour effectuée"]);
}

$stmt->close();
$conn->close();
?>
