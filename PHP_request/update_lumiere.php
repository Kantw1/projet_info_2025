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
$etat = $data['etat'] ?? null;
$intensite = isset($data['intensite']) ? intval($data['intensite']) : null;
$couleur = $data['couleur'] ?? null;
$action = $data['action'] ?? null;

if (!$id || $etat === null || $intensite === null || !$couleur || !$action) {
    echo json_encode(["success" => false, "error" => "Données incomplètes"]);
    exit();
}

if ($intensite < 0 || $intensite > 100) {
    echo json_encode(["success" => false, "error" => "Intensité hors bornes"]);
    exit();
}

try {
    // ✅ Mise à jour dans la table lumière
    $stmt = $conn->prepare("
        UPDATE lumiere
        SET etat = ?, intensite = ?, couleur = ?, derniere_interaction = NOW()
        WHERE id_objet_connecte = ?
    ");
    $stmt->bind_param("iisi", $etat, $intensite, $couleur, $id);
    $stmt->execute();
    $stmt->close();

    // ✅ Insertion dans l'historique (sans consommation)
    $stmt = $conn->prepare("
        INSERT INTO historique_lumiere (
            id_objet_connecte, id_user, date_heure, etat, intensite, couleur, action
        ) VALUES (?, ?, NOW(), ?, ?, ?, ?)
    ");
    $stmt->bind_param("iiiiss", $id, $idUser, $etat, $intensite, $couleur, $action);
    $stmt->execute();
    $stmt->close();

     // Incrémenter les points
            $updateStmt = $conn->prepare("UPDATE USERS SET point = point + 1 WHERE idUser = ?");
            $updateStmt->bind_param("i", $id);
            $updateStmt->execute();
            $updateStmt->close();

    echo json_encode(["success" => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}



