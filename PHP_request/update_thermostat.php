<?php
session_start();

$host = "localhost";
$dbname = "smarthouse";
$username = "root";
$password = "";

$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur de connexion : " . $conn->connect_error]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (
    isset($data['id_objet_connecte']) &&
    isset($data['temperature_cible']) &&
    isset($data['humidite_cible'])
) {
    $id = $data['id_objet_connecte'];

    // ✅ Récupérer les anciennes valeurs des cibles
    $oldQuery = $conn->prepare("SELECT temperature_cible, humidite_cible FROM thermostat WHERE id_objet_connecte = ?");
    $oldQuery->bind_param("i", $id);
    $oldQuery->execute();
    $oldQuery->bind_result($oldTemp, $oldHum);
    $oldQuery->fetch();
    $oldQuery->close();

    // Vérifie si les cibles ont réellement changé
    $targetTempChanged = abs($data['temperature_cible'] - $oldTemp) > 0.01;
    $targetHumChanged = abs($data['humidite_cible'] - $oldHum) > 0.01;

    $query = "UPDATE thermostat SET temperature_cible = ?, humidite_cible = ?";
    $types = "dd";
    $params = [$data['temperature_cible'], $data['humidite_cible']];
    $hasInteraction = false;

    if (isset($data['temperature_actuelle'])) {
        $query .= ", temperature_actuelle = ?";
        $types .= "d";
        $params[] = $data['temperature_actuelle'];
        $hasInteraction = true;
    }

    if (isset($data['humidite_affichee'])) {
        $query .= ", humidite_affichee = ?";
        $types .= "d";
        $params[] = $data['humidite_affichee'];
        $hasInteraction = true;
    }

    if (isset($data['consommation_electricite'])) {
        $query .= ", consommation_electricite = ?";
        $types .= "d";
        $params[] = $data['consommation_electricite'];
    }

    $query .= ", derniere_interaction = NOW()";

    if ($hasInteraction) {
        $query .= ", type_interaction = 'Mise à jour automatique'";
    }

    $query .= " WHERE id_objet_connecte = ?";
    $types .= "i";
    $params[] = $id;

    $stmt = $conn->prepare($query);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true]);

        // ✅ Insérer dans historique uniquement si cible temp ou humidité a changé
        if ($targetTempChanged || $targetHumChanged) {
            $consommation = $data['consommation_electricite'] ?? null;
            $stmt_hist = $conn->prepare("INSERT INTO historique_thermostat (id_objet_connecte, consommation_electricite) VALUES (?, ?)");
            $stmt_hist->bind_param("id", $id, $consommation);
            $stmt_hist->execute();
            $stmt_hist->close();
        }

        $idUser = $_SESSION['id'];

 // Incrémenter les points
            $updateStmt = $conn->prepare("UPDATE USERS SET point = point + 1 WHERE id = ?");
            $updateStmt->bind_param("i", $idUser);
            $updateStmt->execute();
            $updateStmt->close();

    } else {
        echo json_encode(["success" => false, "message" => "Aucune modification"]);
    }

    $stmt->close();
} else {
    http_response_code(400);
    echo json_encode(["error" => "Paramètres manquants"]);
}



$conn->close();
