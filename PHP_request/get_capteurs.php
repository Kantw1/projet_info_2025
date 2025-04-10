<?php
session_start();
header('Content-Type: application/json');

// Connexion à la base de données
$conn = new mysqli("localhost", "root", "", "smarthouse");
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Connexion échouée"]);
    exit();
}

// Vérifie si l'utilisateur est authentifié (ici tu peux vérifier s'il y a un utilisateur dans la session)
if (!isset($_SESSION['id'])) {
    echo json_encode(["success" => false, "error" => "Utilisateur non authentifié"]);
    exit();
}

// Récupère l'id de la maison de l'utilisateur
$idUtilisateur = $_SESSION['id']; // L'id de l'utilisateur, à adapter selon ta logique
$sql = "
    SELECT c.lieu, c.etat_signal 
    FROM capteur c
    JOIN objet_connecte o ON c.id_objet_connecte = o.id
    JOIN house h ON o.id_house = h.id
    WHERE h.id IN (SELECT id_house FROM users WHERE id = ?)";
    
// Prépare la requête
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $idUtilisateur);
$stmt->execute();
$result = $stmt->get_result();

$capteurs = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $capteurs[] = [
            'lieu' => $row['lieu'],
            'etat_signal' => $row['etat_signal'] // État du signal du capteur
        ];
    }
    echo json_encode(["success" => true, "capteurs" => $capteurs]);
} else {
    echo json_encode(["success" => false, "message" => "Aucun capteur trouvé"]);
}

$stmt->close();
$conn->close();
?>
