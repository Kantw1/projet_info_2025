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


---

## 🧪 Environnement de test

Ce projet utilise **WAMP** pour exécuter PHP/MySQL en local, et **MailHog** pour simuler l’envoi d’emails (inscription, réinitialisation...).

---

## 📬 Configuration de MailHog (envoi d’emails en local)

### 📦 Installation

1. Télécharger MailHog (Windows) ici :  
   [https://github.com/mailhog/MailHog/releases](https://github.com/mailhog/MailHog/releases)

2. Extraire ou placer `MailHog.exe` dans un dossier (ex : `C:\tools\MailHog\`)

3. Double-cliquer sur `MailHog.exe` pour le lancer

---

### 🚀 Utilisation

- **Port SMTP** : `1025`  
- **Interface Web** : [http://localhost:8025](http://localhost:8025)

Tout mail envoyé par PHP sera intercepté par MailHog et affiché ici.

---

### ⚙️ Configuration PHP (dans les scripts)

Ajoutez ces lignes dans vos scripts d’envoi de mail (`send_reset_link.php`, inscription, etc.) :

```php
ini_set('SMTP', 'localhost');
ini_set('smtp_port', 1025);
ini_set('sendmail_from', 'admin@smarthouse.local');
