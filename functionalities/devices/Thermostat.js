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
    thermostats: []    
  },
  computed: {
    circumference() {
      return 2 * Math.PI * this.radius;
    },
    groupedThermostats() {
      return this.thermostats.reduce((acc, t) => {
        if (!acc[t.position]) acc[t.position] = [];
        acc[t.position].push(t);
        return acc;
      }, {});
    }    
  },
  methods: {
    sendUpdate(index) {
      const t = this.thermostats[index];
      const payload = {
        id_objet_connecte: t.id, // tu dois inclure `id` dans les données chargées
        temperature_cible: t.target,
        humidite_cible: t.targetHumidity,
        temperature_actuelle: t.temp, // ✅ ajout de la température réelle
        humidite_affichee: t.humidity,  // ✅ ici l'humidité actuelle affichée
        consommation_electricite: t.electricityConsumption
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
    dashOffset(target) {
      const ratio = (target - this.minTemp) / (this.maxTemp - this.minTemp);
      return this.circumference * (1 - ratio);
    },
    calculatedEnergy(t) {
      const tempImpact = Math.max(0, t.currentDisplayedTemp - this.baseTemp) * 1.5;
      const humidityImpact = Math.max(0, t.humidityDisplayed - this.baseHumidity) * 0.5;
      return parseFloat((tempImpact + humidityImpact).toFixed(1));
    },        
    logInteraction(index, action) {
      const maintenant = new Date();
      this.thermostats[index].derniereInteraction = `${action} - ${maintenant.toLocaleString()}`;
    },
    clickToUpdateTemperature(e, index) {
      // reserved for click events if needed
    },
    startDrag(e, index) {
      this.dragging = true;
      this.draggedIndex = index;
      this.updateTargetFromEvent(e, index);
    },
    onDrag(e, index) {
      if (this.dragging && this.draggedIndex === index) {
        this.updateTargetFromEvent(e, index);
      }
    },
    endDrag(index) {
      if (this.dragging && this.draggedIndex === index) {
        this.dragging = false;
        this.animateTemperature(index);
      }
    },
    computeTemperatureFromEvent(e) {
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      angle = (angle + 360 + 90) % 360;
      return this.minTemp + (angle / 360) * (this.maxTemp - this.minTemp);
    },
    updateTargetFromEvent(e, index) {
      const t = this.thermostats[index];
      if (t.connectivity === 'Déconnecté') return;
      const newTarget = Math.round(this.computeTemperatureFromEvent(e));
      t.target = newTarget;
      this.logInteraction(index, `Changement de température à ${newTarget}°C`);
    },
    adjustHumidity(delta, index) {
      const t = this.thermostats[index];
      if (t.connectivity === 'Déconnecté') return;
      const newTarget = Math.max(0, Math.min(100, t.targetHumidity + delta));
      t.targetHumidity = newTarget;
      this.animateHumidity(index);
      this.logInteraction(index, `Réglage de l'humidité à ${newTarget}%`);
    },
    animateTemperature(index) {
      const t = this.thermostats[index];
      let lastUpdateTime = Date.now(); // ✅ Début du timer
    
      const step = () => {
        const diff = t.target - t.currentDisplayedTemp;
        const distance = Math.abs(diff);
    
        if (distance < 0.01) {
          t.currentDisplayedTemp = t.target;
          t.temp = t.target;
          this.sendUpdate(index); // ✅ Dernière MAJ finale
          return;
        }
    
        const easing = 0.0002 + 0.005 / (distance + 1);
        t.currentDisplayedTemp += diff * easing;
        t.temp += diff * easing * 0.8;
    
        const now = Date.now();
        if (now - lastUpdateTime >= 5000) {
          this.sendUpdate(index);
          lastUpdateTime = now;
        }
    
        requestAnimationFrame(step);
      };
    
      requestAnimationFrame(step);
    },
    animateHumidity(index) {
      const t = this.thermostats[index];
      let lastUpdateTime = Date.now(); // ✅ Timer pour MAJ toutes les 5s
    
      const step = () => {
        const diff = t.targetHumidity - t.humidityDisplayed;
        const distance = Math.abs(diff);
    
        if (distance < 0.05) {
          t.humidityDisplayed = t.targetHumidity;
          t.humidity = t.targetHumidity;
          this.sendUpdate(index); // ✅ Dernière MAJ finale
          return;
        }
    
        const easing = 0.002 + 0.01 / (distance + 1);
        t.humidityDisplayed += diff * easing;
        t.humidity = t.humidityDisplayed;
    
        const now = Date.now();
        if (now - lastUpdateTime >= 5000) {
          this.sendUpdate(index);
          lastUpdateTime = now;
        }
    
        requestAnimationFrame(step);
      };
    
      requestAnimationFrame(step);
    },
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
          
          // 🔁 Lancer l’animation si besoin
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
        this.fetchThermostats();
      }
    });
  
    // ✅ Mise à jour conso toutes les 5s uniquement si visible
    setInterval(() => {
      if (!this.visible) return;
  
      this.thermostats.forEach((t, i) => {
        const newCons = this.calculatedEnergy(t);
        if (Math.abs(newCons - t.electricityConsumption) > 0.1) {
          t.electricityConsumption = newCons;
          this.sendUpdate(i);
        }
      });
    }, 5000);
  },  
});
