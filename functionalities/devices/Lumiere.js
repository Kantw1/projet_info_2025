// Lumiere.js


// Composant Vue.js pour la gestion des lumières


new Vue({
  el: '#lumiere-component',  // Lien avec l'élément HTML du composant
  data: {
    visible: false,  
    lumieres: [],  
    couleursOptions: ['Blanc', 'Jaune', 'Bleu', 'Rouge', 'Vert'],  
    totalConsommation: 0,  
    lastAction: '',
    userType: '',
    erreurAutorisation: '',
  },

  mounted() {
    // Cette méthode est appelée lorsque le composant est monté
    console.log("→ Composant Lumière monté");
    
    // Ajoute un écouteur d'événements pour détecter quand un périphérique est sélectionné
    window.addEventListener('device-selected', (e) => {
      const selection = e.detail && e.detail.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      console.log("→ Event reçu dans Lumière :", selection);
      this.visible = selection === 'lumiere';  // Vérifie si le composant "lumière" est sélectionné
      if (this.visible) {
        this.chargerLumieres();  // Charger les lumières depuis la base de données
        this.chargerTypeUtilisateur();  // Charger le type d'utilisateur
      }
    });
  },

  methods: {
    // Vérifie si l'utilisateur a les droits nécessaires pour effectuer une action
    estAutorise(typesAutorises, action = '') {
      const autorise = typesAutorises.includes(this.userType);
      if (!autorise) {
        this.erreurAutorisation = `⛔ Action "${action}" non autorisée pour le rôle "${this.userType}"`;
        setTimeout(() => this.erreurAutorisation = '', 4000); // Efface le message d'erreur après 4 secondes
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

    // Charge les informations des lumières depuis le serveur
    chargerLumieres() {
      fetch('../PHP_request/get_lumiere.php')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            this.lumieres = data.lumieres;  // Met à jour la liste des lumières
            this.calculerConsommation();  // Calcule la consommation totale d'énergie
            this.chargerDerniereAction();  // Récupère la dernière action effectuée
          } else {
            console.error("Erreur lors du chargement des lumières :", data.error);
          }
        })
        .catch(err => {
          console.error("Erreur réseau lors du chargement des lumières :", err);
        });
    },

    // Charge la dernière action effectuée sur les lumières
    chargerDerniereAction() {
      fetch('../PHP_request/get_last_lumiere_action.php')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            this.lastAction = `${data.action} (par ${data.utilisateur}, ${this.formatDate(data.horodatage)})`;
          }
        })
        .catch(err => {
          console.error("Erreur réseau lors de la récupération de la dernière action :", err);
        });
    },

    // Formate la date dans un format lisible
    formatDate(datetime) {
      const options = {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      };
      return new Date(datetime).toLocaleString('fr-FR', options);
    },

    // Met à jour l'état d'une lumière dans la base de données
    updateLumiere(index) {
      const lum = this.lumieres[index];
      const payload = {
        id: lum.id_objet_connecte,
        etat: lum.etat ? 1 : 0,
        intensite: Number.isFinite(lum.intensite) ? lum.intensite : 0,
        couleur: lum.couleur,
        action: this.lastAction
      };

      fetch('../PHP_request/update_lumiere.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          console.error("Erreur lors de la mise à jour :", data.error);
        }
      })
      .catch(err => {
        console.error("Erreur réseau :", err);
      });
    },

    // Allume une lumière spécifique
    allumerLumiere(index) {
      if (!this.estAutorise(['admin', 'Complexe utilisateur', 'Simple utilisateur'], 'Allumer lumière')) return;
      const lum = this.lumieres[index];
      if (!lum.etat) {
        lum.etat = true;
        if (lum.intensite === 0) lum.intensite = 100;  // Définit l'intensité à 100 si elle est à 0
        this.lastAction = `${lum.nom} allumée`;
        this.calculerConsommation();  // Recalcule la consommation d'énergie
        this.updateLumiere(index);  // Met à jour la lumière dans la base de données
      }
    },

    // Éteint une lumière spécifique
    eteindreLumiere(index) {
      if (!this.estAutorise(['admin', 'Complexe utilisateur', 'Simple utilisateur'], 'Eteindre lumière')) return;
      const lum = this.lumieres[index];
      if (lum.etat) {
        lum.etat = false;
        this.lastAction = `${lum.nom} éteinte`;
        this.calculerConsommation();
        this.updateLumiere(index);
      }
    },

    // Ajuste l'intensité d'une lumière spécifique
    ajusterIntensite(index, valeur) {
      if (!this.estAutorise(['admin', 'Complexe utilisateur', 'Simple utilisateur'], 'Régler intensité lumière')) return;
      const lum = this.lumieres[index];
      lum.intensite = valeur;
      lum.etat = valeur > 0;  // Allume la lumière si l'intensité est supérieure à 0
      this.lastAction = `Intensité de ${lum.nom} ajustée à ${valeur}%`;
      this.calculerConsommation();
      this.updateLumiere(index);
    },

    // Change la couleur d'une lumière spécifique
    changerCouleur(index, nouvelleCouleur) {
      if (!this.estAutorise(['admin', 'Complexe utilisateur', 'Simple utilisateur'], 'Changer lumière')) return;
      const lum = this.lumieres[index];
      lum.couleur = nouvelleCouleur;
      this.lastAction = `Couleur de ${lum.nom} changée en ${nouvelleCouleur}`;
      this.updateLumiere(index);
    },

    // Allume toutes les lumières
    allumerToutes() {
      if (!this.estAutorise(['admin', 'Complexe utilisateur', 'Simple utilisateur'], 'Allumer toutes les lumières')) return;
      this.lumieres.forEach((lum, index) => {
        if (!lum.etat) {
          lum.etat = true;
          if (lum.intensite === 0) lum.intensite = 100;
          this.lastAction = `${lum.nom} allumée automatiquement`;
          this.updateLumiere(index);
        }
      });
      this.lastAction = 'Toutes les lumières allumées';
      this.calculerConsommation();
    },

    // Éteint toutes les lumières
    eteindreToutes() {
      if (!this.estAutorise(['admin', 'Complexe utilisateur', 'Simple utilisateur'], 'Eteindre toutes les lumières')) return;
      this.lumieres.forEach((lum, index) => {
        if (lum.etat) {
          lum.etat = false;
          this.lastAction = `${lum.nom} éteinte automatiquement`;
          this.updateLumiere(index);
        }
      });
      this.lastAction = 'Toutes les lumières éteintes';
      this.calculerConsommation();
    },

    // Calcule la consommation totale d'énergie des lumières
    calculerConsommation() {
      let total = 0;
      const puissanceMax = 0.06;  // Puissance maximale en kW
      this.lumieres.forEach(lum => {
        const consommation = lum.etat ? (lum.consommation_electricite * (lum.intensite / 100)) : 0;
        total += consommation;
      });
      this.totalConsommation = total;
    },

    // Récupère la couleur CSS associée à une couleur choisie
    getCssColor(couleur) {
      const map = {
        'Blanc': 'white',
        'Jaune': 'gold',
        'Bleu': 'dodgerblue',
        'Rouge': 'tomato',
        'Vert': 'limegreen'
      };
      return map[couleur] || 'gray';  // Retourne une couleur par défaut si non trouvée
    }
  },

  created() {
    // Cette méthode est appelée lors de la création du composant
    window.addEventListener('device-selected', this.handleDeviceSelected);
    this.calculerConsommation();
    this.lastAction = 'Aucune action pour le moment';
  },

  beforeDestroy() {
    // Cette méthode est appelée avant que le composant ne soit détruit
    window.removeEventListener('device-selected', this.handleDeviceSelected);
  }
});
