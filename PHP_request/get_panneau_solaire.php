<?php
session_start();
header('Content-Type: application/json');

$conn = new mysqli("localhost", "root", "", "smarthouse");
$conn->set_charset("utf8mb4");

// 🔒 Vérification session
if (!isset($_SESSION['objets_connectes']['PanneauSolaire'])) {
    echo json_encode(["success" => false, "error" => "Aucun panneau solaire associé à la session"]);
    exit();
}

$idPanneau = $_SESSION['objets_connectes']['PanneauSolaire'][0];

// 📦 Récupération des données depuis la table panneau_solaire
$sql = "
    SELECT 
        production_kw, capacite_kwc, consommation_kw,
        temperature_c, tension_v, co2_evite_kg,
        actif, derniere_mise_a_jour
    FROM panneau_solaire
    WHERE id_objet_connecte = ?
";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $idPanneau);
$stmt->execute();
$result = $stmt->get_result();
$data = $result->fetch_assoc();
$stmt->close();

if (!$data) {
    echo json_encode(["success" => false, "error" => "Panneau solaire introuvable"]);
    exit();
}

// ✅ Formater réponse
$response = [
    "success" => true,
    "production" => (float)$data['production_kw'],
    "capacite" => (float)$data['capacite_kwc'],
    "consommation" => (float)$data['consommation_kw'],
    "temperature" => (int)$data['temperature_c'],
    "tension" => (int)$data['tension_v'],
    "co2" => (float)$data['co2_evite_kg'],
    "etat" => $data['actif'] ? "Actif" : "Inactif",
    "derniereMiseAJour" => date("d/m/Y H:i", strtotime($data['derniere_mise_a_jour']))
];

echo json_encode($response);
$conn->close();
