CREATE TABLE house(
    id INT PRIMARY KEY,
    adresse VARCHAR(255),
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users(
    id INT PRIMARY KEY,
    lastname VARCHAR(255), 
    firstname VARCHAR(255),
    mail VARCHAR(255),  
    type VARCHAR(255),
    password VARCHAR(255),
    point INT,
    autorisationAdmin VARCHAR(10) DEFAULT 'OUI',
    id_house INT,
    FOREIGN KEY (id_house) REFERENCES house(id)
);

CREATE TABLE objet_connecte(
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(255),
    id_house INT,
    FOREIGN KEY (id_house) REFERENCES house(id)  
);

CREATE TABLE thermostat (
    id_objet_connecte INT PRIMARY KEY,
    nom_objet VARCHAR(255),
    position VARCHAR(100),
    temperature_actuelle FLOAT,
    temperature_cible FLOAT,
    humidite_cible FLOAT,
    humidite_affichee FLOAT,
    connectivite VARCHAR(50),
    consommation_electricite FLOAT,
    derniere_interaction DATETIME,
    type_interaction VARCHAR(100),
    FOREIGN KEY (id_objet_connecte) REFERENCES objet_connecte(id)
);

CREATE TABLE historique_thermostat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_objet_connecte INT,
    date_heure DATETIME DEFAULT CURRENT_TIMESTAMP,
    consommation_electricite FLOAT,
    FOREIGN KEY (id_objet_connecte) REFERENCES thermostat(id_objet_connecte)
);

CREATE TABLE volet_roulant (
    id_objet_connecte INT PRIMARY KEY,  -- identifiant unique lié à objet_connecte
    nom_objet VARCHAR(255),             -- nom complet du volet (ex : "Volet salon")
    position VARCHAR(100),              -- emplacement dans la maison (ex : "Salon")
    ouverture INT CHECK (ouverture BETWEEN 0 AND 100), -- 0 à 100%
    statut VARCHAR(50) CHECK (
        statut IN ('ouvert', 'fermé', 'partiellement ouvert')
    ),
    connectivite VARCHAR(50) CHECK (
        connectivite IN ('Signal fort', 'Signal moyen', 'Signal faible', 'Déconnecté')
    ),
    consommation_electricite FLOAT,
    derniere_interaction DATETIME,
    type_interaction VARCHAR(100),
    mode_securite BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_objet_connecte) REFERENCES objet_connecte(id)
);

CREATE TABLE historique_volet_roulant (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_objet_connecte INT,
    id_user INT,
    date_heure DATETIME DEFAULT CURRENT_TIMESTAMP,
    ouverture INT,
    consommation_electricite FLOAT,
    action VARCHAR(255),
    FOREIGN KEY (id_objet_connecte) REFERENCES volet_roulant(id_objet_connecte),
    FOREIGN KEY (id_user) REFERENCES USERS(id)
);

CREATE TABLE alarme (
    id INT PRIMARY KEY,
    est_active BOOLEAN DEFAULT FALSE,
    est_partielle BOOLEAN DEFAULT FALSE,
    niveau_signal VARCHAR(20) CHECK (niveau_signal IN ('faible', 'moyen', 'fort')),
    consommation FLOAT DEFAULT 0,
    mot_de_passe VARCHAR(10) NOT NULL, -- uniquement des chiffres (ex: '4321')
    derniere_maj DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES objet_connecte(id)
);


CREATE TABLE historique_alarme (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_alarme INT,
    id_user INT,
    date_action DATETIME DEFAULT CURRENT_TIMESTAMP,
    action VARCHAR(100), -- ex: "Activée", "Désactivée", "Activée (partielle)"
    FOREIGN KEY (id_alarme) REFERENCES alarme(id),
    FOREIGN KEY (id_user) REFERENCES utilisateur(id)
);

CREATE TABLE alerte_intrusion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_alarme INT,
    id_capteur INT,
    date_alerte DATETIME DEFAULT CURRENT_TIMESTAMP,
    message TEXT,
    criticite VARCHAR(50) DEFAULT 'Critique',
    FOREIGN KEY (id_alarme) REFERENCES alarme(id),
    FOREIGN KEY (id_capteur) REFERENCES capteur(id)
);

CREATE TABLE capteur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_objet_connecte INT NOT NULL,
    lieu VARCHAR(255),
    etat_signal VARCHAR(20) CHECK (etat_signal IN ('faible', 'moyen', 'fort')),
    FOREIGN KEY (id_objet_connecte) REFERENCES objet_connecte(id)
);

CREATE TABLE lumiere (
    id_objet_connecte INT PRIMARY KEY,  -- Clé primaire et clé étrangère
    nom VARCHAR(255) NOT NULL,
    piece VARCHAR(255),
    etat BOOLEAN DEFAULT FALSE,
    intensite INT CHECK (intensite BETWEEN 0 AND 100),
    couleur VARCHAR(50) CHECK (couleur IN ('Blanc', 'Jaune', 'Bleu', 'Rouge', 'Vert')),
    connectivite VARCHAR(50) CHECK (connectivite IN ('Fort', 'Moyen', 'Faible')),
    consommation_electricite FLOAT DEFAULT 0.0,
    derniere_interaction DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_objet_connecte) REFERENCES objet_connecte(id)
);

CREATE TABLE historique_lumiere (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_objet_connecte INT,
    id_user INT,
    date_heure DATETIME DEFAULT CURRENT_TIMESTAMP,
    etat BOOLEAN,  -- État de la lumière (true = allumée, false = éteinte)
    intensite INT CHECK (intensite BETWEEN 0 AND 100),  -- Intensité de la lumière (de 0 à 100%)
    couleur VARCHAR(50) CHECK (couleur IN ('Blanc', 'Jaune', 'Bleu', 'Rouge', 'Vert')),  -- Couleur de la lumière
    action VARCHAR(255),  -- Action réalisée (ex: "Allumée", "Éteinte", "Ajustée", etc.)
    FOREIGN KEY (id_objet_connecte) REFERENCES lumiere(id_objet_connecte),
    FOREIGN KEY (id_user) REFERENCES users(id)
);

CREATE TABLE arrosage (
    id_objet_connecte INT PRIMARY KEY,  -- Clé étrangère + identifiant unique de l’arrosage
    actif BOOLEAN DEFAULT TRUE,         -- L’arrosage est-il activé ?
    humidite_sol INT CHECK (humidite_sol BETWEEN 0 AND 100),  -- % d’humidité
    heure_modification DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_objet_connecte) REFERENCES objet_connecte(id)
);


CREATE TABLE planning_arrosage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_objet_connecte INT,
    heure TIME,                         -- Heure programmée (ex: 07:30)
    FOREIGN KEY (id_objet_connecte) REFERENCES objet_connecte(id)
);

CREATE TABLE historique_arrosage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_objet_connecte INT,
    date_irrigation DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Date et heure de début
    duree_minutes INT CHECK (duree_minutes BETWEEN 1 AND 120), -- Durée d’arrosage en minutes
    FOREIGN KEY (id_objet_connecte) REFERENCES objet_connecte(id)
);


CREATE TABLE panneau_solaire (
    id_objet_connecte INT PRIMARY KEY,       -- Identifiant unique + clé étrangère
    production_kw FLOAT DEFAULT 0.0,         -- Production instantanée (kW)
    capacite_kwc FLOAT DEFAULT 6.0,          -- Capacité totale en kWc
    consommation_kw FLOAT DEFAULT 0.0,       -- Consommation instantanée simulée (kW)
    temperature_c INT DEFAULT 25,            -- Température panneau en °C
    tension_v INT DEFAULT 230,               -- Tension (V)
    economie_kwh FLOAT DEFAULT 0.0,          -- Économie totale (kWh)
    co2_evite_kg FLOAT DEFAULT 0.0,          -- CO₂ évité (kg)
    actif BOOLEAN DEFAULT TRUE,              -- Statut actif/inactif
    derniere_mise_a_jour DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_objet_connecte) REFERENCES objet_connecte(id)
);


CREATE TABLE historique_panneau_solaire (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_objet_connecte INT,
    date_heure DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Heure de l'enregistrement
    production_kw FLOAT,                            -- Production mesurée (kW)
    FOREIGN KEY (id_objet_connecte) REFERENCES objet_connecte(id)
);


CREATE TABLE electricity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_house INT NOT NULL,
    type_objet VARCHAR(50), -- Ex: Thermostat, Lumière, Panneau Solaire
    conso_kwh DECIMAL(10,2) NOT NULL, -- négatif si production
    mois VARCHAR(20) NOT NULL, -- Ex: 'avril'
    annee INT NOT NULL,        -- Ex: 2025

    FOREIGN KEY (id_house) REFERENCES house(id)
);

CREATE TABLE water (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_house INT NOT NULL,
    type_objet VARCHAR(50),       -- Ex: Arrosage, Lave-linge, etc.
    conso_litre DECIMAL(10,2) NOT NULL, -- consommation en litres
    mois VARCHAR(20) NOT NULL,    -- ex: 'avril'
    annee INT NOT NULL,           -- ex: 2025

    FOREIGN KEY (id_house) REFERENCES house(id)
);


CREATE TABLE password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(64) NOT NULL,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES utilisateur(id)
);
