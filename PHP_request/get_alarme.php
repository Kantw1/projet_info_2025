<?php
session_start();
header('Content-Type: application/json');

$host = "localhost";
$username = "root";
$password = "";
$dbname = "smarthouse";

$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Erreur de connexion BDD"]);
    exit();
}

// Vérifie que l'utilisateur est connecté et que la session est valide
if (!isset($_SESSION['id_house']) || !isset($_SESSION['objets_connectes']['Alarme'])) {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Session invalide"]);
    exit();
}

$idAlarmeList = $_SESSION['objets_connectes']['Alarme'];
$idAlarme = $idAlarmeList[0] ?? null; // Une seule alarme par maison

if (!$idAlarme) {
    echo json_encode(["success" => false, "error" => "Aucune alarme trouvée pour cette maison"]);
    exit();
}

// Récupération des infos de l'alarme
$stmt = $conn->prepare("SELECT est_active, est_partielle, niveau_signal, consommation, mot_de_passe, derniere_maj FROM alarme WHERE id = ?");
$stmt->bind_param("i", $idAlarme);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $row = $result->fetch_assoc()) {
    echo json_encode([
        "success" => true,
        "isActive" => (bool)$row['est_active'],
        "isPartial" => (bool)$row['est_partielle'],
        "signalStrength" => $row['niveau_signal'],
        "energyUsed" => (float)$row['consommation'],
        "password" => $row['mot_de_passe'], // ⬅️ ici
        "lastUpdate" => $row['derniere_maj']
    ]);    
} else {
    echo json_encode(["success" => false, "error" => "Aucune donnée trouvée pour cette alarme"]);
}

$stmt->close();
$conn->close();
