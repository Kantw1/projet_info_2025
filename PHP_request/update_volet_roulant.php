<?php
session_start();
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$conn = new mysqli("localhost", "root", "", "smarthouse");
$conn->set_charset("utf8mb4");

$idUser = $_SESSION['id'] ?? null;
if (!$idUser) {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Utilisateur non authentifié"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? null;
$position = $data['position'] ?? null;
$statut = $data['statut'] ?? null;
$consommation = $data['consommation'] ?? 0;
$action = $data['action'] ?? null;

if (!$id || $position === null || !$statut || !$action) {
    echo json_encode(["success" => false, "error" => "Données incomplètes"]);
    exit();
}

try {
    // ✅ Mise à jour volet_roulant
    $stmt = $conn->prepare("
        UPDATE volet_roulant
        SET ouverture = ?, statut = ?, consommation_electricite = consommation_electricite + ?, 
            derniere_interaction = NOW(), type_interaction = ?
        WHERE id_objet_connecte = ?
    ");
    $stmt->bind_param("isdsi", $position, $statut, $consommation, $action, $id);
    $stmt->execute();
    $stmt->close();

    // ✅ Insertion dans l'historique avec id_user
    $stmt = $conn->prepare("
        INSERT INTO historique_volet_roulant (id_objet_connecte, id_user, date_heure, ouverture, consommation_electricite, action)
        VALUES (?, ?, NOW(), ?, ?, ?)
    ");
    $stmt->bind_param("iiids", $id, $idUser, $position, $consommation, $action);
    $stmt->execute();
    $stmt->close();

    echo json_encode(["success" => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

 // Incrémenter les points
            $updateStmt = $conn->prepare("UPDATE USERS SET point = point + 1 WHERE idUser = ?");
            $updateStmt->bind_param("i", $id);
            $updateStmt->execute();
            $updateStmt->close();

