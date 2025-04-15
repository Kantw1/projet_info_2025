// Eau.js


// Composant Vue.js pour la gestion de la consommation d'eau


new Vue({
  // Point de montage du composant : l'élément HTML avec l'ID "consommation-eau"
  el: '#consommation-eau',

  // Données internes utilisées dans le template et les méthodes
  data: {
    visible: false,
    totalEau: 0,
    afficherDetails: false,
    chartInstance: null,
    afficherHistorique: false,
    moisActuel: new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' }),
    objetsEau: []
  },

  // Code exécuté automatiquement une fois le composant monté dans le DOM
  mounted() {
    console.log('💧 Composant Consommation Eau prêt');

    // Chargement initial des données de consommation d’eau
    this.chargerConsoEau();

    // Écoute d'un événement global indiquant quel appareil est sélectionné
    // Si "eau" est sélectionné, on rend cette interface visible
    window.addEventListener('device-selected', (e) => {
      const selection = e.detail && e.detail.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
      this.visible = selection === 'eau';
    });
  },

  // Surveille certains changements de données pour déclencher du code automatiquement
  watch: {
    // Lorsque l'affichage de l'historique passe à true, on affiche le graphique
    afficherHistorique(val) {
      if (val) {
        this.$nextTick(() => this.renderHistorique());
      }
    }
  },

  // Méthodes de logique métier ou d’interaction utilisateur
  methods: {
    // Récupère et affiche les données historiques dans un graphique à barres
    renderHistorique() {
      fetch("../PHP_request/get_water_historique.php")
        .then(res => res.json())
        .then(data => {
          if (!Array.isArray(data)) return;

          const labels = data.map(entry => entry.mois);
          const values = data.map(entry => entry.litres);

          // On attend que le DOM ait bien inséré le canvas pour le graphique
          this.$nextTick(() => {
            const canvas = document.getElementById("chart-eau");
            if (!canvas) return console.error("❌ Canvas introuvable");

            const ctx = canvas.getContext("2d");

            // Si un ancien graphique existe déjà, on le détruit avant d’en créer un nouveau
            if (this.chartInstance) this.chartInstance.destroy();

            // Création du graphique avec Chart.js
            this.chartInstance = new Chart(ctx, {
              type: "bar",
              data: {
                labels: labels,
                datasets: [{
                  label: "Consommation d’eau mensuelle (L)",
                  data: values,
                  backgroundColor: "#3498db"
                }]
              },
              options: {
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }
            });
          });
        })
        .catch(err => {
          console.error("Erreur lors du chargement de l'historique eau :", err);
        });
    },

    // Récupère les données de consommation d'eau actuelles depuis le serveur
    chargerConsoEau() {
      fetch("../PHP_request/get_water.php")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            this.objetsEau = data;
            this.totalEau = data.reduce((acc, obj) => acc + parseFloat(obj.conso), 0); // Somme des consommations
          } else {
            console.warn("⚠️ Erreur récupération eau :", data.error);
          }
        })
        .catch(err => {
          console.error("Erreur réseau (eau) :", err);
        });
    }
  }
});
