new Vue({
    el: '#lumiere-component',
    data: {
      visible: false,
      lumieres: [],
      couleursOptions: ['Blanc', 'Jaune', 'Bleu', 'Rouge', 'Vert'],
      totalConsommation: 0,
      lastAction: ''
    },
  
    mounted() {
      console.log("→ Composant Lumière monté");
      window.addEventListener('device-selected', (e) => {
        const selection = e.detail && e.detail.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        console.log("→ Event reçu dans Lumière :", selection);
        this.visible = selection === 'lumiere';
        if (this.visible) {
          this.chargerLumieres();  // Charger les lumières depuis la base de données
        }
      });
    },
  
    methods: {
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
        const lum = this.lumieres[index];
        if (lum.etat) {
          lum.etat = false;
          this.lastAction = `${lum.nom} éteinte`;
          this.calculerConsommation();
          this.updateLumiere(index);
        }
      },
  
      ajusterIntensite(index, valeur) {
        const lum = this.lumieres[index];
        lum.intensite = valeur;
        lum.etat = valeur > 0;
        this.lastAction = `Intensité de ${lum.nom} ajustée à ${valeur}%`;
        this.calculerConsommation();
        this.updateLumiere(index);
      },
  
      changerCouleur(index, nouvelleCouleur) {
        const lum = this.lumieres[index];
        lum.couleur = nouvelleCouleur;
        this.lastAction = `Couleur de ${lum.nom} changée en ${nouvelleCouleur}`;
        this.updateLumiere(index);
      },
  
      allumerToutes() {
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
  