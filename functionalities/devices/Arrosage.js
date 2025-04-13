new Vue({
    el: '#arrosage-automatique-component',
    data: {
      visible: false,
      actif: null,
      humiditeSol: null,
      prochaineIrrigation: 'Aucune irrigation prévue', // optionnel
      historique: [],
      planning: [],
      nouvelleHeure: '',
      userType: '',
      erreurAutorisation: '',
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
      estAutorise(typesAutorises, action = '') {
        const autorise = typesAutorises.includes(this.userType);
        if (!autorise) {
          this.erreurAutorisation = `⛔ Action "${action}" non autorisée pour le rôle "${this.userType}"`;
          setTimeout(() => this.erreurAutorisation = '', 4000); // efface le message après 4 sec
        }
        return autorise;
      },
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
        toggleArrosage() {
            fetch('../PHP_request/toggle_arrosage.php', {
              method: 'POST'
            })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                this.actif = data.actif; // met à jour l'état réel depuis le serveur
                console.log(`✔ Arrosage ${this.actif ? "activé" : "désactivé"}`);
          
                // S'il y a eu enregistrement d'un historique
                if (data.historique_ajoute) {
                  console.log(`💾 Durée ajoutée à l'historique : ${data.duree} min`);
                  this.chargerArrosage(); // recharge l'historique et la prochaine irrigation
                }
              } else {
                console.error("❌ Erreur de mise à jour :", data.error);
              }
            })
            .catch(err => {
              console.error("❌ Erreur réseau :", err);
            });
          },
      ajouterHeure() {
        const heure = this.nouvelleHeure.trim();
        if (/^\d{2}:\d{2}$/.test(heure) && !this.planning.includes(heure)) {
          // Ajout local
          this.planning.push(heure);
          this.nouvelleHeure = '';
      
          // Ajout en BDD
          fetch('../PHP_request/add_planning_arrosage.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ heure: heure })
          })
          .then(res => res.json())
          .then(data => {
            if (!data.success) {
              console.error("Erreur lors de l'ajout du planning :", data.error);
            } else {
              console.log("✔ Heure ajoutée à la base de données");
              this.chargerArrosage();
            }
          })
          .catch(err => {
            console.error("Erreur réseau :", err);
          });
        }
      },
      supprimerHeure(index) {
        const heureSupprimee = this.planning[index];
        this.planning.splice(index, 1);
      
        fetch('../PHP_request/delete_planning_arrosage.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ heure: heureSupprimee })
        })
        .then(res => res.json())
        .then(data => {
          if (!data.success) {
            console.error("Erreur lors de la suppression du planning :", data.error);
          } else {
            console.log("✔ Heure supprimée de la base de données");
            this.chargerArrosage();
          }
        })
        .catch(err => {
          console.error("Erreur réseau :", err);
        });
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
          this.chargerTypeUtilisateur();
        }
      });
    }
  });
  