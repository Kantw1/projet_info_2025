// Electricite.js


// Composant Vue.js pour la gestion de la consommation d'électricité


new Vue({
  // Point de montage du composant : l'élément HTML avec l'ID "consommation-electricite"
  el: '#consommation-electricite',

  // Données internes utilisées dans le template et les méthodes
  data: {
    visible: false,
    total: 0,
    afficherDetails: false,
    chartInstance: null,
    afficherHistorique: false,
    moisActuel: new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' }),
    objets: []
  },

  // Surveille certains changements de données pour déclencher du code automatiquement
  watch: {
    // Lorsque l'affichage de l'historique passe à true, on affiche le graphique
    afficherHistorique(val) {
      if (val) {
        this.$nextTick(() => {
          this.renderHistorique(); // Rendu du graphique historique
        });
      }
    }
  },

  // Code exécuté automatiquement une fois le composant monté dans le DOM
  mounted() {
    console.log("→ Composant Électricité monté");

    // Chargement initial des données de consommation d’électricité
    this.chargerConsoDepuisBDD();

    // Écoute d'un événement global indiquant quel appareil est sélectionné
    // Si "electricite" est sélectionné, on rend cette interface visible
    window.addEventListener('device-selected', (e) => {
      const selection = e.detail && e.detail.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
      this.visible = selection === 'electricite';
    });
  },

  // Méthodes de logique métier ou d’interaction utilisateur
  methods: {
    // Récupère et affiche les données historiques dans un graphique à barres
    renderHistorique() {
      fetch("../PHP_request/get_electricite_historique.php")
        .then(res => res.json())
        .then(data => {
          if (!Array.isArray(data)) return;

          const labels = data.map(entry => entry.mois);
          const values = data.map(entry => entry.kwh);

          // On attend que le DOM ait bien inséré le canvas pour le graphique
          this.$nextTick(() => {
            const canvas = document.getElementById("chart-elec");
            if (!canvas) {
              console.error("❌ Canvas non trouvé !");
              return;
            }

            const ctx = canvas.getContext("2d");

            // Si un ancien graphique existe déjà, on le détruit avant d’en créer un nouveau
            if (this.chartInstance) this.chartInstance.destroy();

            // Création du graphique avec Chart.js
            this.chartInstance = new Chart(ctx, {
              type: "bar",
              data: {
                labels: labels,  // Labels (mois)
                datasets: [{
                  label: "Consommation mensuelle (kWh)",  // Légende de l'axe Y
                  data: values,  // Données de consommation (kWh)
                  backgroundColor: "#3498db"
                }]
              },
              options: {
                responsive: true,  // Rendre le graphique responsive
                scales: {
                  y: { 
                    beginAtZero: true  // Commencer l'axe Y à 0
                  }
                }
              }
            });
          });
        })
        .catch(err => {
          console.error("Erreur lors du chargement de l'historique :", err);
        });
    },

    // Récupère les données de consommation d'électricité depuis la base de données
    chargerConsoDepuisBDD() {
      fetch("../PHP_request/get_electricite.php")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            this.objets = data;
            // Calcul du total de la consommation d'électricité
            this.total = data.reduce((acc, obj) => acc + parseFloat(obj.conso), 0).toFixed(1);
          } else {
            console.warn("⚠️ Erreur récupération des consommations :", data.error);
          }
        })
        .catch(err => {
          console.error("Erreur réseau :", err);
        });
    }
  }
});
