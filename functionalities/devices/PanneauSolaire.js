// PanneauSolaire component

new Vue({
    el: '#panneau-solaire-component',
    data: {
    visible: false,
    production:0, // en kW
    capacite: 0, // en kWc
    consommation: 0, // en kW
    temperature: 0, // en °C
    tension: 0, // en V
    economieEuro: 0, // en €
    economieKWh: 0, // en kWh
    co2: 0, // en kg
    tauxUtilisation: 0, // 60% d'utilisation simulée
    derniereMiseAJour: '',
    etat: '',
    afficherEconomieEnKwh: false,
    userType: '',
    },
    methods: {
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
        chargerPanneauSolaire() {
            fetch('../PHP_request/get_panneau_solaire.php')
              .then(res => res.json())
              .then(data => {
                if (data.success) {
                  this.production = data.production;
                  this.capacite = data.capacite;
                  this.consommation = data.consommation;
                  this.temperature = data.temperature;
                  this.tension = data.tension;
                  this.economieKWh = Math.floor(this.production - this.consommation);
                  this.economieEuro = Math.floor(this.economieKWh * 2,1);
                  this.co2 = data.co2;
                  this.tauxUtilisation = this.production/this.capacite;
                  this.etat = data.etat;
                  this.derniereMiseAJour = data.derniereMiseAJour;
                  console.log("✔ Panneau solaire chargé depuis la BDD");
                } else {
                  console.error("❌ Erreur récupération panneau :", data.error);
                }
              })
              .catch(err => {
                console.error("❌ Erreur réseau :", err);
              });
          },          
    // Basculer entre affichage € / kWh
    toggleAffichageEconomie() {
        this.afficherEconomieEnKwh = !this.afficherEconomieEnKwh;
    },

    // Mise à jour de la capacité (prompt pour l'instant)
    changerCapacite() {
        const nouvelle = parseFloat(prompt("Nouvelle capacité max (kWc) :", this.capacite));
        if (!isNaN(nouvelle) && nouvelle > 0) {
        this.capacite = nouvelle;
        }
    },

    //pour obtenir la date actuelle
    getDateActuelle() {
        const now = new Date();
        const date = now.toLocaleDateString('fr-FR');
        const heure = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        return `${date} ${heure}`;
    },

    // Activation/désactivation
    toggleEtat() {
        fetch('../PHP_request/toggle_panneau_solaire.php', {
          method: 'POST'
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            this.etat = data.etat;
            this.chargerPanneauSolaire(); // recharge la date de mise à jour
            console.log("✔ État du panneau mis à jour :", data.etat);
          } else {
            console.error("❌ Erreur :", data.error);
          }
        })
        .catch(err => {
          console.error("❌ Erreur réseau :", err);
        });
      },
    
    //met a jour les modifs effectues
    changerCapacite() {
        const nouvelle = parseFloat(prompt("Nouvelle capacité max (kWc) :", this.capacite));
        if (!isNaN(nouvelle) && nouvelle > 0) {
          fetch('../PHP_request/update_capacite_panneau.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ capacite: nouvelle })
          })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              this.capacite = data.capacite;
              this.chargerPanneauSolaire(); // recharge les données mises à jour
              console.log("✔ Capacité mise à jour :", data.capacite, "kWc");
            } else {
              console.error("❌ Erreur mise à jour capacité :", data.error);
            }
          })
          .catch(err => {
            console.error("❌ Erreur réseau :", err);
          });
        }
      },

    getStatutColor() {
        switch (this.etat) {
        case 'Actif': return 'limegreen';
        case 'Inactif': return 'gray';
        default: return 'orange';
        }
    }
    },
    mounted() {
    console.log("→ Composant Panneau Solaire monté");
    window.addEventListener('device-selected', (e) => {
        const selection = e.detail && e.detail.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
        this.visible = selection === 'panneau solaire';
        if (this.visible) {
            this.chargerPanneauSolaire();
          }
    });
    },
    computed: {
    consommationAffichee() {
        if (this.etat !== 'Actif') return '0.00';
        const consommation = this.production * this.tauxUtilisation;
        return consommation.toFixed(2);
    }
    }
});
  