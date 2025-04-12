new Vue({
    el: '#arrosage-automatique-component',
    data: {
      visible: false,
      actif: null,
      humiditeSol: null,
      prochaineIrrigation: 'Aucune irrigation prévue', // optionnel
      historique: [],
      planning: [],
      nouvelleHeure: ''
    },
    computed: {
      messageEtatSol() {
        if (this.humiditeSol === null) return 'Chargement...';
        if (this.humiditeSol >= 60) return '🌿 Sol bien hydraté';
        if (this.humiditeSol >= 30) return '🌱 Niveau d’humidité correct';
        return '⚠️ Arrosage nécessaire';
      },
      humiditeColor() {
        if (this.humiditeSol === null) return 'gray';
        if (this.humiditeSol >= 60) return 'limegreen';
        if (this.humiditeSol >= 30) return 'orange';
        return 'crimson';
      }
    },
    methods: {
      toggleArrosage() {
        this.actif = !this.actif;
        // 👉 tu peux ici appeler un fichier PHP (ex: toggle_arrosage.php)
      },
      ajouterHeure() {
        const heure = this.nouvelleHeure.trim();
        if (/^\d{2}:\d{2}$/.test(heure) && !this.planning.includes(heure)) {
          this.planning.push(heure);
          this.nouvelleHeure = '';
          // 👉 tu peux POST vers add_planning_arrosage.php ici
        }
      },
      supprimerHeure(index) {
        const heureSupprimée = this.planning[index];
        this.planning.splice(index, 1);
        // 👉 tu peux POST vers delete_planning_arrosage.php ici
      },
      chargerArrosage() {
        // Général
        fetch('../PHP_request/get_arrosage_general.php')
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              this.actif = data.actif;
              this.humiditeSol = data.humiditeSol;
            }
          });
  
        // Planning
        fetch('../PHP_request/get_arrosage_planning.php')
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              this.planning = data.planning;
            }
          });
  
        // Historique
        fetch('../PHP_request/get_arrosage_historique.php')
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              this.historique = data.historique;
            }
          });

          // Prochaine irrigation
        fetch('../PHP_request/get_prochaine_irrigation.php')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    this.prochaineIrrigation = data.prochaineIrrigation;
                }
        });
      }
    },
    mounted() {
      console.log('→ Composant Arrosage Automatique monté');
      window.addEventListener('device-selected', (e) => {
        const selection = e.detail && e.detail.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
        this.visible = selection === 'arrosage';
        if (this.visible) {
          this.chargerArrosage();
        }
      });
    }
  });
  