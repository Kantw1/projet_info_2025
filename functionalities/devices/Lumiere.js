new Vue({
    el: '#lumiere-component',
    data: {
      visible: false,
      lumieres: [
        { nom: 'Lampe Salon', piece: 'Salon', etat: false, intensite: 0, couleur: 'Blanc', connectee: true },
        { nom: 'Lampe Cuisine', piece: 'Cuisine', etat: true, intensite: 75, couleur: 'Jaune', connectee: true },
        { nom: 'Lampe Chambre', piece: 'Chambre', etat: true, intensite: 50, couleur: 'Bleu', connectee: false }
      ],
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
      });
    },
  
    methods: {
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
        }
      },
  
      eteindreLumiere(index) {
        const lum = this.lumieres[index];
        if (lum.etat) {
          lum.etat = false;
          this.lastAction = `${lum.nom} éteinte`;
          this.calculerConsommation();
        }
      },
  
      ajusterIntensite(index, valeur) {
        const lum = this.lumieres[index];
        lum.intensite = valeur;
        lum.etat = valeur > 0;
        this.lastAction = `Intensité de ${lum.nom} ajustée à ${valeur}%`;
        this.calculerConsommation();
      },
  
      changerCouleur(index, nouvelleCouleur) {
        const lum = this.lumieres[index];
        lum.couleur = nouvelleCouleur;
        this.lastAction = `Couleur de ${lum.nom} changée en ${nouvelleCouleur}`;
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
  