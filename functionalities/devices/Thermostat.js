// Thermostat.js


// Composant Vue.js pour la gestion des thermostat


new Vue({
  el: '#thermostat-component',
  data: {
    visible: false,
    dragging: false,
    draggedIndex: null,
    minTemp: 10,
    maxTemp: 30,
    baseTemp: 20,
    baseHumidity: 50,
    radius: 80,
    thermostats: [],
    userType: '',
    erreurAutorisation: '',
  },
  computed: {
    // Calcul de la circonférence du thermostat pour l'affichage
    circumference() {
      return 2 * Math.PI * this.radius;
    },
    // Regroupe les thermostats par position (utile si les thermostats sont organisés en positions)
    groupedThermostats() {
      return this.thermostats.reduce((acc, t) => {
        if (!acc[t.position]) acc[t.position] = [];
        acc[t.position].push(t);
        return acc;
      }, {});
    }
  },
  methods: {
    // Vérifie si l'utilisateur est autorisé à effectuer une action
    estAutorise(typesAutorises, action = '') {
      const autorise = typesAutorises.includes(this.userType);
      if (!autorise) {
        this.erreurAutorisation = `⛔ Action "${action}" non autorisée pour le rôle "${this.userType}"`;
        setTimeout(() => this.erreurAutorisation = '', 4000); // efface le message après 4 sec
      }
      return autorise;
    },
    
    // Récupère le type d'utilisateur depuis l'API
    chargerTypeUtilisateur() {
      fetch('../PHP_request/get_user_type.php')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            this.userType = data.type; // Mise à jour du type d'utilisateur
            console.log("Type utilisateur :", this.userType);
          } else {
            console.warn("⚠️ Impossible de récupérer le type d'utilisateur :", data.error);
          }
        })
        .catch(err => {
          console.error("Erreur réseau type utilisateur :", err);
        });
    },

    // Envoie les mises à jour des thermostats vers le serveur
    sendUpdate(index) {
      const t = this.thermostats[index];
      const payload = {
        id_objet_connecte: t.id, // ID du thermostat
        temperature_cible: t.target, // Température cible du thermostat
        humidite_cible: t.targetHumidity, // Humidité cible
        temperature_actuelle: t.temp, // Température actuelle
        humidite_affichee: t.humidity,  // Humidité actuelle affichée
        consommation_electricite: t.electricityConsumption // Consommation d'électricité
      };

      fetch('../PHP_request/update_thermostat.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(response => {
        if (!response.success) {
          console.warn("Échec de la mise à jour :", response.message);
        }
      })
      .catch(err => console.error("Erreur réseau :", err));
    },

    // Calcule le décalage de l'angle en fonction de la température cible
    dashOffset(target) {
      const ratio = (target - this.minTemp) / (this.maxTemp - this.minTemp);
      return this.circumference * (1 - ratio); // Utilisé pour l'animation
    },

    // Calcule l'impact énergétique d'un thermostat basé sur sa température et humidité
    calculatedEnergy(t) {
      const tempImpact = Math.max(0, t.currentDisplayedTemp - this.baseTemp) * 1.5;
      const humidityImpact = Math.max(0, t.humidityDisplayed - this.baseHumidity) * 0.5;
      return parseFloat((tempImpact + humidityImpact).toFixed(1)); // Retourne l'énergie calculée
    },

    // Log des interactions avec le thermostat
    logInteraction(index, action) {
      const maintenant = new Date();
      this.thermostats[index].derniereInteraction = `${action} - ${maintenant.toLocaleString()}`;
    },

    // Gère les événements de clics pour mettre à jour la température (pour des clics simples)
    clickToUpdateTemperature(e, index) {
      // Cette fonction est réservée aux clics si nécessaire
    },

    // Commence à faire glisser un thermostat (utilisé pour l'animation de déplacement)
    startDrag(e, index) {
      this.dragging = true;
      this.draggedIndex = index;
      this.updateTargetFromEvent(e, index); // Mise à jour de la température en fonction de la position
    },

    // Met à jour la température d'un thermostat en fonction de la position du curseur
    onDrag(e, index) {
      if (this.dragging && this.draggedIndex === index) {
        this.updateTargetFromEvent(e, index);
      }
    },

    // Termine l'animation de la température une fois le glissement terminé
    endDrag(index) {
      if (this.dragging && this.draggedIndex === index) {
        this.dragging = false;
        this.animateTemperature(index);
      }
    },

    // Calcule la température en fonction de la position du curseur dans le SVG
    computeTemperatureFromEvent(e) {
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      angle = (angle + 360 + 90) % 360; // Conversion de l'angle en température
      return this.minTemp + (angle / 360) * (this.maxTemp - this.minTemp);
    },

    // Met à jour la température cible en fonction de la position de la souris
    updateTargetFromEvent(e, index) {
      if (!this.estAutorise(['admin', 'Complexe utilisateur'], 'Ajuster température')) return;
      const t = this.thermostats[index];
      if (t.connectivity === 'Déconnecté') return;
      const newTarget = Math.round(this.computeTemperatureFromEvent(e)); // Température arrondie
      t.target = newTarget;
      this.logInteraction(index, `Changement de température à ${newTarget}°C`); // Log l'interaction
    },

    // Ajuste l'humidité d'un thermostat
    adjustHumidity(delta, index) {
      if (!this.estAutorise(['admin', 'Complexe utilisateur'], 'Ajuster humidité')) return;
      const t = this.thermostats[index];
      if (t.connectivity === 'Déconnecté') return;
      const newTarget = Math.max(0, Math.min(100, t.targetHumidity + delta)); // Ajustement de l'humidité
      t.targetHumidity = newTarget;
      this.animateHumidity(index);
      this.logInteraction(index, `Réglage de l'humidité à ${newTarget}%`);
    },

    // Anime le changement de température du thermostat (transition douce)
    animateTemperature(index) {
      const t = this.thermostats[index];
      let lastUpdateTime = Date.now(); // Timer pour envoyer les mises à jour

      const step = () => {
        const diff = t.target - t.currentDisplayedTemp;
        const distance = Math.abs(diff);

        if (distance < 0.01) { // Si la température est proche de la cible
          t.currentDisplayedTemp = t.target;
          t.temp = t.target;
          this.sendUpdate(index); // Dernière mise à jour
          return;
        }

        const easing = 0.0002 + 0.005 / (distance + 1); // Ajuste l'animation en fonction de la distance
        t.currentDisplayedTemp += diff * easing;
        t.temp += diff * easing * 0.8;

        const now = Date.now();
        if (now - lastUpdateTime >= 5000) { // Envoie une mise à jour toutes les 5 secondes
          this.sendUpdate(index);
          lastUpdateTime = now;
        }

        requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    },

    // Anime le changement d'humidité du thermostat
    animateHumidity(index) {
      const t = this.thermostats[index];
      let lastUpdateTime = Date.now(); // Timer pour les mises à jour toutes les 5 secondes

      const step = () => {
        const diff = t.targetHumidity - t.humidityDisplayed;
        const distance = Math.abs(diff);

        if (distance < 0.05) { // Si l'humidité est proche de la cible
          t.humidityDisplayed = t.targetHumidity;
          t.humidity = t.targetHumidity;
          this.sendUpdate(index); // Dernière mise à jour
          return;
        }

        const easing = 0.002 + 0.01 / (distance + 1); // Ajuste l'animation en fonction de la distance
        t.humidityDisplayed += diff * easing;
        t.humidity = t.humidityDisplayed;

        const now = Date.now();
        if (now - lastUpdateTime >= 5000) { // Envoie une mise à jour toutes les 5 secondes
          this.sendUpdate(index);
          lastUpdateTime = now;
        }

        requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    },

    // Récupère la liste des thermostats depuis l'API
    fetchThermostats() {
      fetch('../PHP_request/get_thermostat.php')
        .then(res => res.json())
        .then(data => {
          this.thermostats = data.map(t => ({
            id: t.id_objet_connecte,
            name: t.nom_objet,
            position: t.position,
            target: parseFloat(t.temperature_cible),
            currentDisplayedTemp: parseFloat(t.temperature_actuelle),
            temp: parseFloat(t.temperature_actuelle),
            targetHumidity: parseFloat(t.humidite_cible),
            humidityDisplayed: parseFloat(t.humidite_affichee),
            humidity: parseFloat(t.humidite_affichee),
            connectivity: t.connectivite,
            electricityConsumption: parseFloat(t.consommation_electricite),
            derniereInteraction: t.derniere_interaction || 'Aucune',
            lastEnergyUpdate: Date.now(),
          }));

          // Lancer l'animation si nécessaire
          this.thermostats.forEach((t, i) => {
            if (Math.abs(t.temp - t.target) > 0.1) {
              this.animateTemperature(i);
            }
            if (Math.abs(t.humidity - t.targetHumidity) > 0.1) {
              this.animateHumidity(i);
            }
          });
        })
        .catch(err => {
          console.error("Erreur lors du chargement des thermostats :", err);
        });
    }
  },
  mounted() {
    console.log('Thermostat component monté');
    
    window.addEventListener('device-selected', (e) => {
      this.visible = e.detail?.toLowerCase() === 'thermostat';
      if (this.visible) {
        this.fetchThermostats(); // Charge les thermostats lorsque visible
        this.chargerTypeUtilisateur();
      }
    });

    // Mise à jour de la consommation d'électricité toutes les 5 secondes si visible
    setInterval(() => {
      if (!this.visible) return;

      this.thermostats.forEach((t, i) => {
        const newCons = this.calculatedEnergy(t);
        if (Math.abs(newCons - t.electricityConsumption) > 0.1) {
          t.electricityConsumption = newCons;
          this.sendUpdate(i); // Mise à jour des données
        }
      });
    }, 5000);
  },
});

