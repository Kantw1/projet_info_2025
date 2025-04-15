// Alarme.js


// Composant Vue.js pour la gestion de l'alarme de sécurité

new Vue({
  // Point de montage du composant : l'élément HTML avec l'ID "alarm-component"
  el: '#alarm-component',

  // Données internes utilisées dans le template et les méthodes
  data: {
    visible: false,
    isActive: null,
    isPartial: null,
    signalStrength: null,
    energyUsed: 0,
    historique: [],
    alertes: [],
    currentUser: "Ahmed l'Admin",
    askCodeFor: null,
    codeSaisi: '',
    energyInterval: null,
    capteurs: ["Détecteur salon", "Porte d'entrée", "Fenêtre chambre", "Garage", "Cuisine", "Jardin"],
    alarmPassword: null,
    activationTime: null,
    userType: '',
    erreurAutorisation: '',
  },

  // Code exécuté automatiquement une fois le composant monté dans le DOM
  mounted() {
    this.visible = false;
    
    // Écoute de l'événement global indiquant quel appareil est sélectionné
    window.addEventListener('device-selected', (e) => {
      const selection = e.detail && e.detail.toLowerCase();
      this.visible = selection === 'alarme'; // Affiche le composant si l'alarme est sélectionnée

      const backdrop = document.getElementById('backdrop');
      if (backdrop) {
        backdrop.style.display = this.visible ? 'block' : 'none'; // Affiche ou cache le fond selon l'état de visibilité
      }

      if (this.visible) {
        this.chargerAlarme(); // Charge les informations de l'alarme si visible
      }
    });
    
    // Chargement des données initiales de l'historique, capteurs et type utilisateur
    this.chargerHistorique();
    this.chargerCapteurs();
    this.chargerTypeUtilisateur();
  },

  // Propriétés calculées basées sur les données
  computed: {
    // Label pour la force du signal de l'alarme
    signalStrengthLabel() {
      switch (this.signalStrength) {
        case 'fort': return 'Forte';
        case 'moyen': return 'Moyenne';
        case 'faible': return 'Faible';
        default: return 'Inconnue';
      }
    },

    // Format de la consommation énergétique
    energyFormatted() {
      if (this.energyUsed == null || isNaN(this.energyUsed)) return '0.00 kWh';
      return this.energyUsed.toFixed(2);
    }
  },

  // Méthodes de logique métier ou d’interaction utilisateur
  methods: {
    // Vérifie si l'utilisateur est autorisé à effectuer une action
    estAutorise(typesAutorises, action = '') {
      const autorise = typesAutorises.includes(this.userType);
      if (!autorise) {
        this.erreurAutorisation = `⛔ Action "${action}" non autorisée pour le rôle "${this.userType}"`;
        setTimeout(() => this.erreurAutorisation = '', 4000); // Efface l'erreur après 4 secondes
      }
      return autorise;
    },

    // Récupère le type d'utilisateur depuis le serveur
    chargerTypeUtilisateur() {
      fetch('../PHP_request/get_user_type.php')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            this.userType = data.type;
            console.log("Type utilisateur :", this.userType);
          } else {
            console.warn("⚠️ Impossible de récupérer le type d'utilisateur :", data.error);
          }
        })
        .catch(err => {
          console.error("Erreur réseau type utilisateur :", err);
        });
    },

    // Récupère l'état de l'alarme depuis le serveur
    chargerAlarme() {
      fetch('../PHP_request/get_alarme.php')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            this.isActive = data.isActive;
            this.isPartial = data.isPartial;
            this.signalStrength = data.signalStrength;
            this.energyUsed = this.isActive ? data.energyUsed : 0;
            this.historique = data.historique || [];
            this.alertes = data.alertes || [];
            this.alarmPassword = data.password;
            this.activationTime = data.lastUpdate;

            // Recharge l'historique et les alertes
            this.chargerHistorique();
            this.chargerAlertes();
          } else {
            console.warn("Erreur chargement alarme :", data.error);
          }
        })
        .catch(err => console.error("Erreur réseau alarme :", err));
    },

    // Sauvegarde l'état actuel de l'alarme dans le serveur
    sauvegarderEtatAlarme() {
      const payload = {
        isActive: this.isActive,
        isPartial: this.isPartial,
        energyUsed: this.energyUsed
      };

      fetch('../PHP_request/update_alarme.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          console.error("Échec mise à jour alarme :", data.error);
        } else {
          console.log("Alarme mise à jour avec succès");
        }
      })
      .catch(err => console.error("Erreur réseau alarme :", err));
    },

    // Demande à l'utilisateur de saisir un code pour activer ou désactiver l'alarme
    askCode(action) {
      this.askCodeFor = action;
      this.codeSaisi = ''; // Réinitialise le champ de code
    },

    // Annule la demande de code
    cancelCode() {
      this.askCodeFor = null;
      this.codeSaisi = '';
    },

    // Valide le code saisi et effectue l'action correspondante
    validerCode() {
      if (!this.estAutorise(['admin', 'Complexe utilisateur'], 'activer/Désactiver alarme')) return;
      if (this.codeSaisi !== this.alarmPassword) {
        alert("Code incorrect.");
        this.codeSaisi = ''; // Réinitialise le code en cas d'erreur
        return;
      }

      if (this.askCodeFor === 'activer') {
        this.isActive = true;
        this.isPartial = false;
        this.chargerHistorique();
        this.activationTime = new Date().toISOString();
        
        // Ferme tous les volets lorsque l'alarme est activée
        fetch('../PHP_request/fermer_tous_les_volets.php')
        .catch(err => {});
      } else if (this.askCodeFor === 'partielle') {
        this.isActive = true;
        this.isPartial = true;
        this.chargerHistorique();
        this.activationTime = new Date().toISOString();
      } else if (this.askCodeFor === 'desactiver') {
        this.isActive = false;
        this.isPartial = false;
        this.chargerHistorique();
        this.stopEnergyConsumption(); // Arrête la consommation énergétique
        this.energyUsed = 0; // Réinitialise la consommation énergétique
      }

      this.askCodeFor = null;
      this.codeSaisi = '';
      this.sauvegarderEtatAlarme(); // Sauvegarde l'état de l'alarme
      this.chargerHistorique(); // Recharge l'historique
    },

    // Arrête l'intervalle de consommation énergétique
    stopEnergyConsumption() {
      clearInterval(this.energyInterval);
      this.energyInterval = null;
    },

    // Charge l'historique des événements de l'alarme depuis le serveur
    chargerHistorique() {
      fetch('../PHP_request/get_historique_alarme.php')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            this.historique = data.historique;
          } else {
            console.warn("Erreur chargement historique :", data.error);
          }
        })
        .catch(err => {
          console.error("Erreur réseau historique :", err);
        });
    },

    // Charge les alertes de l'alarme depuis le serveur
    chargerAlertes() {
      fetch('../PHP_request/get_alertes_alarme.php')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            this.alertes = data.alertes;
          } else {
            console.warn("Erreur chargement alertes :", data.error);
          }
        })
        .catch(err => {
          console.error("Erreur réseau alertes :", err);
        });
    },

    // Charge les capteurs associés à l'alarme depuis le serveur
    chargerCapteurs() {
      fetch('../PHP_request/get_capteurs.php')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            this.capteurs = data.capteurs; // Mets à jour les capteurs
          } else {
            console.error("Erreur lors du chargement des capteurs :", data.error);
          }
        })
        .catch(err => {
          console.error("Erreur réseau lors du chargement des capteurs :", err);
        });
    }
  }
});
