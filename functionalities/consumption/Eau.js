new Vue({
    el: '#consommation-eau',
    data: {
      visible: false,
      totalEau: 0,
      afficherDetails: false,
      chartInstance: null,
      afficherHistorique: false,
      moisActuel: new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' }),
      objetsEau: []
    },
    mounted() {
      console.log('💧 Composant Consommation Eau prêt');
      this.chargerConsoEau();
      window.addEventListener('device-selected', (e) => {
        const selection = e.detail && e.detail.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
        this.visible = selection === 'eau';
      });
    },
    watch: {
        afficherHistorique(val) {
          if (val) {
            this.$nextTick(() => this.renderHistorique());
          }
        }
      },      
    methods: {
        renderHistorique() {
            fetch("../PHP_request/get_water_historique.php")
              .then(res => res.json())
              .then(data => {
                if (!Array.isArray(data)) return;
          
                const labels = data.map(entry => entry.mois);
                const values = data.map(entry => entry.litres);
          
                this.$nextTick(() => {
                  const canvas = document.getElementById("chart-eau");
                  if (!canvas) return console.error("❌ Canvas introuvable");
          
                  const ctx = canvas.getContext("2d");
          
                  if (this.chartInstance) this.chartInstance.destroy();
          
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
      chargerConsoEau() {
        fetch("../PHP_request/get_water.php")
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              this.objetsEau = data;
              this.totalEau = data.reduce((acc, obj) => acc + parseFloat(obj.conso), 0);
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
  