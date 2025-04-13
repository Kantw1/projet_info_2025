new Vue({
    el: '#lumiere-component',
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
      console.log("→ Composant Lumière monté");
      window.addEventListener('device-selected', (e) => {
        const selection = e.detail && e.detail.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        console.log("→ Event reçu dans Lumière :", selection);
        this.visible = selection === 'lumiere';
        if (this.visible) {
          this.chargerLumieres();  // Charger les lumières depuis la base de données
          this.chargerTypeUtilisateur();
        }
      });
    },
  
    methods: {
      estAutorise(typesAutorises, action = '') {
        const autorise = typesAutorises.includes(this.userType);
        if (!autorise) {
          this.erreurAutorisation = `⛔ Action "${action}" non autorisée pour le rôle "${this.userType}"`;
          setTimeout(() => this.erreurAutorisation = '', 4000); // efface le message après 4 sec
        }
        return autorise;
      },
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
      chargerLumieres() {
        fetch('../PHP_request/get_lumiere.php')
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              this.lumieres = data.lumieres; // Met à jour les lumières dans le data
              this.calculerConsommation();
              this.chargerDerniereAction();
            } else {
              console.error("Erreur lors du chargement des lumières :", data.error);
            }
          })
          .catch(err => {
            console.error("Erreur réseau lors du chargement des lumières :", err);
          });
      }, 
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
      
      formatDate(datetime) {
        const options = {
          year: 'numeric', month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit'
        };
        return new Date(datetime).toLocaleString('fr-FR', options);
      },
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
  
      allumerLumiere(index) {
        if (!this.estAutorise(['admin', 'Complexe utilisateur', 'Simple utilisateur'], 'Allumer lumière')) return;
        const lum = this.lumieres[index];
        if (!lum.etat) {
          lum.etat = true;
          if (lum.intensite === 0) lum.intensite = 100;
          this.lastAction = `${lum.nom} allumée`;
          this.calculerConsommation();
          this.updateLumiere(index);
        }
      },
  
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
  
      ajusterIntensite(index, valeur) {
        if (!this.estAutorise(['admin', 'Complexe utilisateur', 'Simple utilisateur'], 'Régler intensité lumière')) return;
        const lum = this.lumieres[index];
        lum.intensite = valeur;
        lum.etat = valeur > 0;
        this.lastAction = `Intensité de ${lum.nom} ajustée à ${valeur}%`;
        this.calculerConsommation();
        this.updateLumiere(index);
      },
  
      changerCouleur(index, nouvelleCouleur) {
        if (!this.estAutorise(['admin', 'Complexe utilisateur', 'Simple utilisateur'], 'Chanager lumière')) return;
        const lum = this.lumieres[index];
        lum.couleur = nouvelleCouleur;
        this.lastAction = `Couleur de ${lum.nom} changée en ${nouvelleCouleur}`;
        this.updateLumiere(index);
      },
  
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
  
      calculerConsommation() {
        let total = 0;
        const puissanceMax = 0.06;
        this.lumieres.forEach(lum => {
          const consommation = lum.etat ? (lum.consommation_electricite  * (lum.intensite / 100)) : 0;
          total += consommation;
        });
        this.totalConsommation = total;
      },
  
      getCssColor(couleur) {
        const map = {
          'Blanc': 'white',
          'Jaune': 'gold',
          'Bleu': 'dodgerblue',
          'Rouge': 'tomato',
          'Vert': 'limegreen'
        };
        return map[couleur] || 'gray';
      }
    },
  
    created() {
      window.addEventListener('device-selected', this.handleDeviceSelected);
      this.calculerConsommation();
      this.lastAction = 'Aucune action pour le moment';
    },
  
    beforeDestroy() {
      window.removeEventListener('device-selected', this.handleDeviceSelected);
    }
  });
  