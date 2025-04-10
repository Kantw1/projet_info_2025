new Vue({
  el: '#alarm-component',
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
  },

  mounted() {
    this.visible = false;
    window.addEventListener('device-selected', (e) => {
      const selection = e.detail && e.detail.toLowerCase();
      this.visible = selection === 'alarme';

      const backdrop = document.getElementById('backdrop');
      if (backdrop) {
        backdrop.style.display = this.visible ? 'block' : 'none';
      }

      if (this.visible) {
        this.chargerAlarme();
      }
    });
    this.chargerHistorique();
    this.chargerCapteurs();
  },

  computed: {
    signalStrengthLabel() {
      switch (this.signalStrength) {
        case 'fort': return 'Forte';
        case 'moyen': return 'Moyenne';
        case 'faible': return 'Faible';
        default: return 'Inconnue';
      }
    },
    energyFormatted() {
      if (this.energyUsed == null || isNaN(this.energyUsed)) return '0.00 kWh';
      return this.energyUsed.toFixed(2) ;
    }
  },

  methods: {
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

            this.chargerHistorique();
            this.chargerAlertes();
          } else {
            console.warn("Erreur chargement alarme :", data.error);
          }
        })
        .catch(err => console.error("Erreur réseau alarme :", err));
    },

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

    askCode(action) {
      this.askCodeFor = action;
      this.codeSaisi = '';
    },

    cancelCode() {
      this.askCodeFor = null;
      this.codeSaisi = '';
    },

    validerCode() {
      if (this.codeSaisi !== this.alarmPassword) {
        alert("Code incorrect.");
        this.codeSaisi = '';
        return;
      }

      if (this.askCodeFor === 'activer') {
        this.isActive = true;
        this.isPartial = false;
        this.chargerHistorique();
        this.activationTime = new Date().toISOString();
         // 🔒 Vérifie si le mode sécurité volet est actif
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
        this.stopEnergyConsumption();
        this.energyUsed = 0;
      }

      this.askCodeFor = null;
      this.codeSaisi = '';
      this.sauvegarderEtatAlarme();
      this.chargerHistorique();
    },   

    stopEnergyConsumption() {
      clearInterval(this.energyInterval);
      this.energyInterval = null;
    },

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
    chargerCapteurs() {
      fetch('../PHP_request/get_capteurs.php')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            this.capteurs = data.capteurs; // Mets à jour les capteurs dans le data
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
