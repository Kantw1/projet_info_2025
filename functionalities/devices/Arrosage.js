// Arrosage.js


// Composant Vue.js pour la gestion de l'arrosage


new Vue({
  el: '#arrosage-automatique-component',
  data: {
    visible: false,
    actif: null,
    humiditeSol: null,
    prochaineIrrigation: 'Aucune irrigation prévue',
    historique: [],
    planning: [],
    nouvelleHeure: '',
    userType: '',
    erreurAutorisation: '',
  },
  computed: {
    // Calcule le message d'état de l'humidité du sol
    messageEtatSol() {
      if (this.humiditeSol === null) return 'Chargement...';  // Si les données ne sont pas chargées
      if (this.humiditeSol >= 60) return '🌿 Sol bien hydraté';
      if (this.humiditeSol >= 30) return '🌱 Niveau d’humidité correct';
      return '⚠️ Arrosage nécessaire';
    },
    // Calcule la couleur d'affichage de l'humidité
    humiditeColor() {
      if (this.humiditeSol === null) return 'gray';  // Si les données ne sont pas chargées
      if (this.humiditeSol >= 60) return 'limegreen';  // Couleur pour sol bien hydraté
      if (this.humiditeSol >= 30) return 'orange';  // Couleur pour humidité correcte
      return 'crimson';  // Couleur pour sol sec
    }
  },
  methods: {
    // Vérifie si l'utilisateur a les droits pour effectuer une action
    estAutorise(typesAutorises, action = '') {
      const autorise = typesAutorises.includes(this.userType);  // Vérifie si le type d'utilisateur est autorisé
      if (!autorise) {
        this.erreurAutorisation = `⛔ Action "${action}" non autorisée pour le rôle "${this.userType}"`;
        setTimeout(() => this.erreurAutorisation = '', 4000);  // Efface le message d'erreur après 4 secondes
      }
      return autorise;
    },
    // Récupère le type d'utilisateur depuis le serveur
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
    // Active ou désactive l'arrosage
    toggleArrosage() {
      if (!this.estAutorise(['admin', 'Complexe utilisateur'], 'Activer/désactiver arrosage')) return;  // Vérifie les droits
      fetch('../PHP_request/toggle_arrosage.php', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            this.actif = data.actif;  // Met à jour l'état de l'arrosage
            console.log(`✔ Arrosage ${this.actif ? "activé" : "désactivé"}`);
            if (data.historique_ajoute) {
              console.log(`💾 Durée ajoutée à l'historique : ${data.duree} min`);
              this.chargerArrosage();  // Recharge l'historique et la prochaine irrigation
            }
          } else {
            console.error("❌ Erreur de mise à jour :", data.error);
          }
        })
        .catch(err => {
          console.error("❌ Erreur réseau :", err);  // Gère les erreurs réseau
        });
    },
    // Ajoute une heure dans le planning des arrosages
    ajouterHeure() {
      if (!this.estAutorise(['admin', 'Complexe utilisateur'], 'Ajouter dans le planning')) return;  // Vérifie les droits
      const heure = this.nouvelleHeure.trim();
      if (/^\d{2}:\d{2}$/.test(heure) && !this.planning.includes(heure)) {
        this.planning.push(heure);  // Ajout local de l'heure
        this.nouvelleHeure = '';

        // Ajout dans la base de données
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
            this.chargerArrosage();  // Recharge l'arrosage après ajout
          }
        })
        .catch(err => {
          console.error("Erreur réseau :", err);  // Gère les erreurs réseau
        });
      }
    },
    // Supprime une heure du planning des arrosages
    supprimerHeure(index) {
      if (!this.estAutorise(['admin', 'Complexe utilisateur'], 'Supprimer une heure du planning')) return;  // Vérifie les droits
      const heureSupprimee = this.planning[index];  // Récupère l'heure à supprimer
      this.planning.splice(index, 1);  // Supprime l'heure localement

      // Supprime dans la base de données
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
          this.chargerArrosage();  // Recharge l'arrosage après suppression
        }
      })
      .catch(err => {
        console.error("Erreur réseau :", err);  // Gère les erreurs réseau
      });
    },
    // Charge les informations sur l'arrosage, l'historique et le planning
    chargerArrosage() {
      fetch('../PHP_request/get_arrosage_general.php')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            this.actif = data.actif;
            this.humiditeSol = data.humiditeSol;
          }
        });

      fetch('../PHP_request/get_arrosage_planning.php')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            this.planning = data.planning;
          }
        });

      fetch('../PHP_request/get_arrosage_historique.php')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            this.historique = data.historique;
          }
        });

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
      this.visible = selection === 'arrosage';  // Vérifie si le composant "arrosage" est sélectionné
      if (this.visible) {
        this.chargerArrosage();  // Charge les données lorsque le composant devient visible
        this.chargerTypeUtilisateur();  // Charge le type d'utilisateur
      }
    });
  }
});
