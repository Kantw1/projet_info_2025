<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['objets_connectes']['VoletRoulant']) || !isset($_SESSION['id'])) {
    echo json_encode(["success" => false, "error" => "Session invalide"]);
    exit();
}

$idUser = $_SESSION['id'];
$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? null;
$ouverture = $data['ouverture'] ?? null;
$fermeture = $data['fermeture'] ?? null;

if (!$id || !$ouverture || !$fermeture) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Données manquantes"]);
    exit();
}

$conn = new mysqli("localhost", "root", "", "smarthouse");
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Erreur de connexion BDD"]);
    exit();
}

try {
    // 🔧 Met à jour les horaires d'ouverture/fermeture
    $stmt = $conn->prepare("UPDATE volet_roulant SET heure_ouverture = ?, heure_fermeture = ? WHERE id_objet_connecte = ?");
    $stmt->bind_param("ssi", $ouverture, $fermeture, $id);
    $stmt->execute();
    $stmt->close();

    // 📝 Ajoute dans l'historique (sans consommation)
    $action = "Programmation mise à jour (ouverture à $ouverture, fermeture à $fermeture)";
    $stmt = $conn->prepare("INSERT INTO historique_volet_roulant (id_objet_connecte, id_user, date_heure, ouverture, consommation_electricite, action) VALUES (?, ?, NOW(), 0, 0, ?)");
    $stmt->bind_param("iis", $id, $idUser, $action);
    $stmt->execute();
    $stmt->close();

    echo json_encode(["success" => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

 // Incrémenter les points
            $updateStmt = $conn->prepare("UPDATE USERS SET point = point + 2 WHERE idUser = ?");
            $updateStmt->bind_param("i", $id);
            $updateStmt->execute();
            $updateStmt->close();


$conn->close();
