// Electricite.js

new Vue({
    el: '#consommation-electricite',
    data: {
    visible: false,
    total: 0,
    afficherDetails: false,
    chartInstance: null,
    afficherHistorique: false,
    moisActuel: new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' }),
    objets: []
    },
    watch: {
        afficherHistorique(val) {
          if (val) {
            this.$nextTick(() => {
              this.renderHistorique();
            });
          }
        }
      },      
    mounted() {
        console.log("→ Composant Électricité monté");
        this.chargerConsoDepuisBDD();
      
        window.addEventListener('device-selected', (e) => {
          const selection = e.detail && e.detail.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
          this.visible = selection === 'electricite';
        });
      },
      methods: {
        renderHistorique() {
            fetch("../PHP_request/get_electricite_historique.php")
              .then(res => res.json())
              .then(data => {
                if (!Array.isArray(data)) return;
          
                const labels = data.map(entry => entry.mois);  // ⬅️ AJOUT ICI
                const values = data.map(entry => entry.kwh);   // ⬅️ ET ICI
          
                this.$nextTick(() => {
                  const canvas = document.getElementById("chart-elec");
                  if (!canvas) {
                    console.error("❌ Canvas non trouvé !");
                    return;
                  }
          
                  const ctx = canvas.getContext("2d");
          
                  if (this.chartInstance) this.chartInstance.destroy();
          
                  this.chartInstance = new Chart(ctx, {
                    type: "bar",
                    data: {
                      labels: labels,
                      datasets: [{
                        label: "Consommation mensuelle (kWh)",
                        data: values,
                        backgroundColor: "#3498db"
                      }]
                    },
                    options: {
                      responsive: true,
                      scales: {
                        y: { beginAtZero: true }
                      }
                    }
                  });
                });
              })
              .catch(err => {
                console.error("Erreur lors du chargement de l'historique :", err);
              });
          },          
        chargerConsoDepuisBDD() {
          fetch("../PHP_request/get_electricite.php")
            .then(res => res.json())
            .then(data => {
              if (Array.isArray(data)) {
                this.objets = data;
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
  