new Vue({
  el: '#alarm-component',
  data: {
    visible: false,
    isActive: false,
    historique: [],
    alertes: [],
    currentUser: "Ahmed l'Admin", // pour le moment c'est un admin en attente pour lajout de la bdd
    askCodeFor: null, // soit 'activer', soit 'desactiver'
    codeSaisi: '',
    signalStrength: 'strong', // ou 'medium', 'weak' fixe pour le moment pour php apres
    energyUsed: 0, // en kWh
    energyInterval: null, // pour la consommation d'énergie
    isPartial: false, // pour la consommation partielle
    capteurs: ["Détecteur salon", "Porte d'entrée", "Fenêtre chambre", "Garage", "Cuisine", "Jardin"], // liste des capteurs
  },

  // Pour le backdrop
  mounted() {
    // Forcer visible à false au démarrage
    this.visible = false;

    console.log("Alarm component monté (visible = false)");

    // Écoute de la sélection d'un device
    window.addEventListener('device-selected', (e) => {
      const selection = e.detail && e.detail.toLowerCase();
      console.log("Device selected:", selection);
      this.visible = selection === 'alarme';

      // Affiche ou masque le backdrop
      const backdrop = document.getElementById('backdrop');
      if (backdrop) {
        backdrop.style.display = (selection === 'alarme') ? 'block' : 'none';
      }
    });

    // Simuler un niveau de signal à l'ouverture
    const niveaux = ['strong', 'medium', 'weak'];

    window.addEventListener('device-selected', (e) => {
      const selection = e.detail && e.detail.toLowerCase();
      this.visible = selection === 'alarme';

      const backdrop = document.getElementById('backdrop');
      if (backdrop) {
        backdrop.style.display = (selection === 'alarme') ? 'block' : 'none';
      }
    });
  },

  computed: {
    signalStrengthLabel() {
      switch (this.signalStrength) {
        case 'strong': return 'Forte';
        case 'medium': return 'Moyenne';
        case 'weak': return 'Faible';
        default: return 'Inconnue';
      }
    },
    energyFormatted() {
      return this.energyUsed.toFixed(2) + ' kWh';
    }
  },


  // les méthodes sont appelées par le template
  methods: {
    activerAlarme() {
      if (!this.isActive) {
        this.isActive = true;
        this.ajouterHistorique("Activée");
      }
    },
    desactiverAlarme() {
      if (this.isActive) {
        this.isActive = false;
        this.ajouterHistorique("Désactivée");
        this.stopEnergyConsumption(); // arrête la consommation d'énergie
        this.energyUsed = 0; // réinitialise la consommation d'énergie
      }
    },
    ajouterHistorique(stat) {
      this.historique.push({
        date: new Date().toLocaleString(),
        status: stat,
        user: this.currentUser
      });
    },
    activerAlarme() {
      const code = prompt("Entrez le code de sécurité pour activer l'alarme :");
      if (code !== "4321") {
        alert("Code incorrect. Activation annulée.");
        return;
      }
    
      if (!this.isActive) {
        this.isActive = true;
        this.ajouterHistorique("Activée");
        this.startEnergyConsumption(); // démarre la consommation d'énergie
      }
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
      if (this.codeSaisi !== '4321') {
        alert("Code incorrect.");
        this.codeSaisi = '';
        return;
      }
    
      if (this.askCodeFor === 'activer') {
        this.isActive = true;
        this.ajouterHistorique("Activée");
        this.startEnergyConsumption(); // démarre la consommation d'énergie
      } else if (this.askCodeFor === 'partielle') {
        this.isActive = true;
        this.isPartial = true;
        this.ajouterHistorique("Activée (partielle)");
        this.startEnergyConsumption(0.005); // consommation partielle
      } else if (this.askCodeFor === 'desactiver') {
        this.isActive = false;
        this.isPartial = false;
        this.ajouterHistorique("Désactivée");
        this.stopEnergyConsumption(); // arrête la consommation d'énergie
        this.energyUsed = 0; // réinitialise la consommation d'énergie
      }
    
      this.askCodeFor = null;
      this.codeSaisi = '';
    },

    startEnergyConsumption(taux = 0.01) {
      if (this.energyInterval) return; // Si déjà en cours
      this.energyInterval = setInterval(() => {
        this.energyUsed += taux; // Consommation d'énergie
      }, 1000); // toutes les secondes
    },
    
    stopEnergyConsumption() {
      clearInterval(this.energyInterval);
      this.energyInterval = null;
    },

    simulerIntrusion() {
      if (this.isActive) {
        this.alertes.push({
          date: new Date().toLocaleString(),
          status: "Critique",
          capteur: this.capteurs[0],
          message: "Intrusion!"
        });
      }
    }
  }
});
