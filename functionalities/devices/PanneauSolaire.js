// PanneauSolaire.js


// PanneauSolaire component


new Vue({
  el: '#panneau-solaire-component',
  data: {
    visible: false,
    production: 0,
    capacite: 0,
    consommation: 0,
    temperature: 0,
    tension: 0,
    economieEuro: 0,
    economieKWh: 0,
    co2: 0,
    tauxUtilisation: 0,
    derniereMiseAJour: '',
    etat: '',
    afficherEconomieEnKwh: false,
    userType: '',
    erreurAutorisation: '',
  },
  methods: {
    // Vérifie si l'utilisateur est autorisé à effectuer l'action
    estAutorise(typesAutorises, action = '') {
      const autorise = typesAutorises.includes(this.userType); // Vérification des types d'utilisateurs autorisés
      if (!autorise) {
        this.erreurAutorisation = `⛔ Action "${action}" non autorisée pour le rôle "${this.userType}"`; // Affichage de l'erreur
        setTimeout(() => this.erreurAutorisation = '', 4000); // Message effacé après 4 secondes
      }
      return autorise;
    },
    
    // Récupère le type d'utilisateur depuis l'API
    chargerTypeUtilisateur() {
      fetch('../PHP_request/get_user_type.php')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            this.userType = data.type; // Affecte le type d'utilisateur
            console.log("Type utilisateur :", this.userType);
          } else {
            console.warn("⚠️ Impossible de récupérer le type d'utilisateur :", data.error);
          }
        })
        .catch(err => {
          console.error("Erreur réseau type utilisateur :", err); // Affiche l'erreur en cas de problème de réseau
        });
    },

    // Charge les données du panneau solaire depuis l'API
    chargerPanneauSolaire() {
      fetch('../PHP_request/get_panneau_solaire.php')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            this.production = data.production; // Mise à jour de la production
            this.capacite = data.capacite; // Mise à jour de la capacité
            this.consommation = data.consommation; // Mise à jour de la consommation
            this.temperature = data.temperature; // Mise à jour de la température
            this.tension = data.tension; // Mise à jour de la tension
            this.economieKWh = Math.floor(this.production - this.consommation); // Calcul de l'économie en kWh
            this.economieEuro = Math.floor(this.economieKWh * 2.1); // Calcul de l'économie en €
            this.co2 = data.co2; // Mise à jour de la réduction de CO2
            this.tauxUtilisation = this.production / this.capacite; // Calcul du taux d'utilisation
            this.etat = data.etat; // Mise à jour de l'état
            this.derniereMiseAJour = data.derniereMiseAJour; // Mise à jour de la date de dernière mise à jour
            console.log("✔ Panneau solaire chargé depuis la BDD");
          } else {
            console.error("❌ Erreur récupération panneau :", data.error); // Affichage de l'erreur en cas d'échec
          }
        })
        .catch(err => {
          console.error("❌ Erreur réseau :", err); // Affichage de l'erreur réseau
        });
    },

    // Bascule entre l'affichage de l'économie en € ou en kWh
    toggleAffichageEconomie() {
      this.afficherEconomieEnKwh = !this.afficherEconomieEnKwh;
    },

    // Demande une nouvelle capacité maximale via un prompt
    changerCapacite() {
      const nouvelle = parseFloat(prompt("Nouvelle capacité max (kWc) :", this.capacite));
      if (!isNaN(nouvelle) && nouvelle > 0) {
        this.capacite = nouvelle;
      }
    },

    // Retourne la date et l'heure actuelles
    getDateActuelle() {
      const now = new Date();
      const date = now.toLocaleDateString('fr-FR');
      const heure = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      return `${date} ${heure}`;
    },

    // Bascule entre l'état actif/inactif du panneau solaire
    toggleEtat() {
      if (!this.estAutorise(['admin', 'Complexe utilisateur'], 'Activer/désactiver panneau solaire')) return;
      fetch('../PHP_request/toggle_panneau_solaire.php', {
        method: 'POST'
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          this.etat = data.etat; // Mise à jour de l'état
          this.chargerPanneauSolaire(); // Recharge les données du panneau
          console.log("✔ État du panneau mis à jour :", data.etat);
        } else {
          console.error("❌ Erreur :", data.error); // Affichage de l'erreur en cas d'échec
        }
      })
      .catch(err => {
        console.error("❌ Erreur réseau :", err); // Affichage de l'erreur réseau
      });
    },

    // Permet de modifier la capacité du panneau solaire
    changerCapacite() {
      if (!this.estAutorise(['admin'], 'Changer la capcité max')) return;
      const nouvelle = parseFloat(prompt("Nouvelle capacité max (kWc) :", this.capacite));
      if (!isNaN(nouvelle) && nouvelle > 0) {
        fetch('../PHP_request/update_capacite_panneau.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ capacite: nouvelle }) // Envoi des données au serveur
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            this.capacite = data.capacite; // Mise à jour de la capacité
            this.chargerPanneauSolaire(); // Recharge les données mises à jour
            console.log("✔ Capacité mise à jour :", data.capacite, "kWc");
          } else {
            console.error("❌ Erreur mise à jour capacité :", data.error); // Affichage de l'erreur
          }
        })
        .catch(err => {
          console.error("❌ Erreur réseau :", err); // Affichage de l'erreur réseau
        });
      }
    },

    // Retourne la couleur correspondant à l'état du panneau solaire
    getStatutColor() {
      switch (this.etat) {
        case 'Actif': return 'limegreen';
        case 'Inactif': return 'gray';
        default: return 'orange'; // Orange par défaut pour un état inconnu
      }
    }
  },
  mounted() {
    console.log("→ Composant Panneau Solaire monté");
    window.addEventListener('device-selected', (e) => {
      const selection = e.detail && e.detail.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
      this.visible = selection === 'panneau solaire';
      if (this.visible) {
        this.chargerPanneauSolaire(); // Charge les données du panneau solaire
        this.chargerTypeUtilisateur(); // Charge le type d'utilisateur
      }
    });
  },
  computed: {
    // Affiche la consommation uniquement si le panneau est actif
    consommationAffichee() {
      if (this.etat !== 'Actif') return '0.00';
      const consommation = this.production * this.tauxUtilisation;
      return consommation.toFixed(2); // Affiche la consommation à 2 décimales
    }
  }
});
