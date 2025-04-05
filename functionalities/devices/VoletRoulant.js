new Vue({
    el: '#volet-roulant-component',
    data: {
      visible: false,
      modeSecurite: false,
      volets: [
        { id: 1, name: 'Volet salon', location: 'Salon', position: 100, status: 'ouvert', connectivity: 'Signal fort' },
        { id: 2, name: 'Volet cuisine', location: 'Cuisine', position: 0, status: 'fermé', connectivity: 'Signal moyen' },
        { id: 3, name: 'Volet chambre parentale', location: 'Chambre parents', position: 50, status: 'partiellement ouvert', connectivity: 'Signal fort' },
        { id: 4, name: 'Volet chambre enfant', location: 'Chambre enfant', position: 80, status: 'partiellement ouvert', connectivity: 'Signal faible' },
        { id: 5, name: 'Volet salle de bain', location: 'Salle de bain', position: 0, status: 'fermé', connectivity: 'Déconnecté' }
      ],
      consommationTotale: 0,
      derniereInteraction: 'Aucune',
      messageErreur: null
    },
    mounted() {
      console.log('Volet roulant component monté');
      window.addEventListener('device-selected', (e) => {
        console.log('Événement reçu :', e.detail);
        this.visible = (e.detail && e.detail.toLowerCase() === 'voletroulant');
        console.log('→ volet-roulant visible =', this.visible);
      });
  
      this.lancerProgrammationHoraire();
    },
    methods: {
      logInteraction(action) {
        const maintenant = new Date();
        this.derniereInteraction = `${action} - ${maintenant.toLocaleString()}`;
      },
      afficherErreur(message) {
        this.messageErreur = message;
        setTimeout(() => {
          this.messageErreur = null;
        }, 3000);
      },
      peutOuvrir(volet) {
        return volet.connectivity !== 'Déconnecté' && volet.position < 100;
      },
      peutFermer(volet) {
        return volet.connectivity !== 'Déconnecté' && volet.position > 0;
      },      
      ouvrirVolet(id) {
        const volet = this.volets.find(v => v.id === id);
        if (!volet) return;
  
        if (volet.connectivity === 'Déconnecté') {
          this.afficherErreur(`${volet.name} est déconnecté. Action impossible.`);
          return;
        }
  
        volet.position = 100;
        volet.status = 'ouvert';
        this.consommationTotale += 0.15;
        this.logInteraction(`Ouverture de ${volet.name}`);
      },
      fermerVolet(id) {
        const volet = this.volets.find(v => v.id === id);
        if (!volet) return;
  
        if (volet.connectivity === 'Déconnecté') {
          this.afficherErreur(`${volet.name} est déconnecté. Action impossible.`);
          return;
        }
  
        volet.position = 0;
        volet.status = 'fermé';
        this.consommationTotale += 0.15;
        this.logInteraction(`Fermeture de ${volet.name}`);
      },
      ajusterVolet(id, value) {
        const volet = this.volets.find(v => v.id === id);
        if (!volet) return;
  
        if (volet.connectivity === 'Déconnecté') {
          this.afficherErreur(`${volet.name} est déconnecté. Réglage impossible.`);
          return;
        }
  
        volet.position = Math.max(0, Math.min(100, value));
        volet.status = (value === 0) ? 'fermé' : (value === 100) ? 'ouvert' : 'partiellement ouvert';
        this.consommationTotale += 0.15;
        this.logInteraction(`Réglage de ${volet.name}`);
      },
      ouvrirTous() {
        this.volets.forEach(v => {
          if (v.connectivity !== 'Déconnecté') {
            v.position = 100;
            v.status = 'ouvert';
            this.consommationTotale += 0.15;
            this.logInteraction(`Ouverture de ${v.name}`);
          } else {
            this.afficherErreur(`${v.name} est déconnecté. Action ignorée.`);
          }
        });
      },
      fermerTous() {
        this.volets.forEach(v => {
          if (v.connectivity !== 'Déconnecté') {
            v.position = 0;
            v.status = 'fermé';
            this.consommationTotale += 0.15;
            this.logInteraction(`Fermeture de ${v.name}`);
          } else {
            this.afficherErreur(`${v.name} est déconnecté. Action ignorée.`);
          }
        });
      },
      toggleModeSecurite() {
        this.modeSecurite = !this.modeSecurite;
        if (this.modeSecurite) {
          this.fermerTous();
          alert("Mode sécurité activé : tous les volets connectés sont fermés.");
        }
      },
      lancerProgrammationHoraire() {
        setInterval(() => {
          const maintenant = new Date();
          if (
            maintenant.getHours() === 21 &&
            maintenant.getMinutes() === 0 &&
            maintenant.getSeconds() === 0
          ) {
            this.fermerTous();
            console.log("Fermeture automatique à 21h");
          }
        }, 1000);
      }
    }
  });
  