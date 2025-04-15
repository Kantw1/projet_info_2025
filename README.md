
# 📡 Projet Domotique – SmartHouse

Bienvenue dans **SmartHouse**, une plateforme web de gestion d’objets connectés pour la maison : volets roulants, thermostat, alarme, arrosage automatique, lumière, panneau solaire...

Ce projet inclut :
- une interface administrateur moderne (Vue.js + HTML/CSS)
- une gestion sécurisée des utilisateurs
- des fonctionnalités dynamiques (ajout, configuration, contrôle des objets)
- un système complet de **réinitialisation de mot de passe avec token sécurisé**
- une **intégration de MailHog** pour simuler l'envoi d'emails en local

---

## 📁 Structure du projet

```
projet_info_2025/
│
├── AdminPage/             → Interface principale (dashboard)
├── Formulaire/            → Formulaires d’ajout d’objets connectés
├── ForgotMyPassword/      → Réinitialisation de mot de passe (formulaire email) et Saisie du nouveau mot de passe (via token)
├── Inscription_connection/→ Inscription et connection des utilisateurs
├── PHP_request/           → Scripts PHP : CRUD, sécurité, base de données
├── functionalities/       → JS dynamiques pour le chargement des scipt.js des objets (Vue.js)
    ├──devices/            → JS dynamiques pour les objets (Vue.js)
    ├──consumption/        → JS dynamiques pour les consommations d'énergies (Vue.js)
├── Points/                → Gestion des points utilisateur (xlsx) et vérification type utilisateur
├── vitrine/               → Page d'accueil / déconnexion
├── sql/                   → 📄 Fichier `smarthouse.sql` à importer dans MySQL
└── README.md              → Ce fichier 📖
```

---

## 🧪 Environnement de test

Ce projet a été conçu pour fonctionner avec :

- ✅ **WAMP / XAMPP / MAMP** (Apache, PHP ≥ 7.4, MySQL ≥ 5.7)
- ✅ **MailHog** pour l’envoi de mails simulé
- ✅ Navigateur moderne (Chrome recommandé)

---

## 🗃️ Base de données : `smarthouse`

### 📦 Import de la base

1. Ouvre **phpMyAdmin**
2. Crée une base nommée `smarthouse`
3. Importe le fichier SQL situé ici :

```
projet_info_2025/sql/smarthouse.sql
```

### 🧑‍💻 Remplir la base pour plus de confort

Tu peux ajouter :

- des `users` avec des rôles `admin` ou `Simple utilisateur`
- des objets connectés manuellement ou via le formulaire
- une maison dans la table `house` (ex : `id = 1`, `adresse = "Test City"`)

---

## 📬 Configuration de MailHog (envoi d’emails en local)

### 📦 Installation

1. Télécharger MailHog ici :  
   👉 [https://github.com/mailhog/MailHog/releases](https://github.com/mailhog/MailHog/releases)

2. Placer `MailHog.exe` dans un dossier (ex : `C:\tools\MailHog\`)

3. Double-cliquer pour lancer MailHog

---

### 🚀 Utilisation

- Serveur SMTP simulé sur le **port `1025`**
- Interface mail à consulter sur :  
  👉 [http://localhost:8025](http://localhost:8025)

---

### ⚙️ Configuration PHP (à inclure dans vos scripts PHP)

```php
ini_set('SMTP', 'localhost');
ini_set('smtp_port', 1025);
ini_set('sendmail_from', 'admin@smarthouse.local');
```

Cela permet d’intercepter les emails avec MailHog (aucun email ne sera réellement envoyé sur Internet).

---

## 🔐 Réinitialisation de mot de passe (workflow)

1. L'utilisateur saisit son mail dans `ForgotMyPassword/`
2. Un token est généré, stocké dans `password_reset_tokens`
3. Un lien contenant ce token est envoyé par MailHog
4. Ce lien redirige vers `ReinitialisePassword.html?token=...`
5. L'utilisateur entre un nouveau mot de passe
6. Le token est supprimé et le mot de passe mis à jour dans la base

---

## 🚀 Lancer le projet en local

### 1. Cloner le dépôt dans `www` (ou `htdocs`)

```bash
cd C:\wamp64\www
git clone https://github.com/kantw1/projet_info_2025.git
```

> Ou télécharge le `.zip` et place le dossier décompressé ici.

### 2. Lancer MailHog

- Ouvrir `MailHog.exe`
- Visiter [http://localhost:8025](http://localhost:8025)

### 3. Lancer le serveur local

- Lancer WAMP
- Accéder au projet via :  
  👉 [http://localhost/projet_info_2025/vitrine/vitrine.html](http://localhost/...)

---

## 📌 Commandes Git utiles

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/ton-utilisateur/projet_info_2025.git
git push -u origin main
```

---

## 📦 Dépendances utilisées

- PHP (avec extensions `PDO`, `mysqli`, `mbstring`)
- Vue.js (CDN)
- Chart.js (CDN pour les graphiques)
- MailHog (outil externe en local)

---

## 👨‍🏫 Auteur

Développé dans le cadre du projet de fin d’année 2025 – École d’ingénieur.  
Auteurs : Quentin Fourrier, Ahmed Metwally
Collaborateurs : Vincent Poulin, Capucine Lardiere, Clément Aouali 
Email : fourrierquentin9@gmail.com

---

## ⚠️ Licence

Projet à usage **éducatif uniquement** – Reproduction ou usage commercial interdits sans accord écrit.
