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
            } else {
              console.error("Erreur lors du chargement des lumières :", data.error);
            }
          })
          .catch(err => {
            console.error("Erreur réseau lors du chargement des lumières :", err);
          });
      },
      updateLumiere(index) {
        const lum = this.lumieres[index];
      
        const payload = {
          id_objet_connecte: lum.id_objet_connecte,
          etat: lum.etat ? 1 : 0,  // Convertir le booléen en 1 ou 0
          intensite: lum.intensite,
          couleur: lum.couleur
        };
      
        // Affichage de ce que vous envoyez pour débogage
        console.log("Données envoyées :", payload);
      
        fetch('../PHP_request/update_lumiere.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        .then(res => {
          console.log("Réponse brute:", res);  // Voir la réponse brute
          return res.json(); // Essayer de convertir la réponse en JSON
        })
        .then(data => {
          console.log('Réponse JSON:', data);  // Afficher la réponse JSON
          if (data.success) {
            console.log("Lumière mise à jour avec succès");
          } else {
            console.error("Erreur lors de la mise à jour de la lumière :", data.error);
          }
        })
        .catch(err => {
          console.error("Erreur réseau lors de la mise à jour de la lumière :", err);
        });
      },      
      handleDeviceSelected(event) {
        this.visible = event.detail === 'Lumiere';
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
        this.lumieres.forEach(lum => {
          if (!lum.etat) {
            lum.etat = true;
            if (lum.intensite === 0) lum.intensite = 100;
          }
        });
        this.lastAction = 'Toutes les lumières allumées';
        this.calculerConsommation();
      },
  
      eteindreToutes() {
        this.lumieres.forEach(lum => lum.etat = false);
        this.lastAction = 'Toutes les lumières éteintes';
        this.calculerConsommation();
      },
  
      calculerConsommation() {
        let total = 0;
        const puissanceMax = 0.06;
        this.lumieres.forEach(lum => {
          const consommation = lum.etat ? (puissanceMax * (lum.intensite / 100)) : 0;
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
  