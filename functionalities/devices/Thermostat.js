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
    thermostats: [
      {
        name: 'Thermostat salon',
        position: 'Salon',
        temp: 22.3,
        target: 23.0,
        currentDisplayedTemp: 22.3,
        connectivity: 'Signal fort',
        targetHumidity: 54,
        humidityDisplayed: 54,
        electricityConsumption: 0,
        derniereInteraction: 'Aucune'
      },
      {
        name: 'Thermostat salon',
        position: 'Salon',
        temp: 22.3,
        target: 23.0,
        currentDisplayedTemp: 22.3,
        connectivity: 'Signal fort',
        targetHumidity: 54,
        humidityDisplayed: 54,
        electricityConsumption: 0,
        derniereInteraction: 'Aucune'
      },
      {
        name: 'Thermostat chambre',
        position: 'Chambre',
        temp: 20.0,
        target: 21.5,
        currentDisplayedTemp: 22.3,
        connectivity: 'Signal moyen',
        targetHumidity: 48,
        humidityDisplayed: 48,
        electricityConsumption: 0,
        derniereInteraction: 'Aucune'
      }
    ]    
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
    dashOffset(target) {
      const ratio = (target - this.minTemp) / (this.maxTemp - this.minTemp);
      return this.circumference * (1 - ratio);
    },
    calculatedEnergy(t) {
      const tempImpact = Math.max(0, t.currentDisplayedTemp - this.baseTemp) * 1.5;
      const humidityImpact = Math.max(0, t.humidityDisplayed - this.baseHumidity) * 0.5;
      return (tempImpact + humidityImpact).toFixed(1);
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
    animateTemperature(index) {
      const t = this.thermostats[index];
      const step = () => {
        const diff = t.target - t.currentDisplayedTemp;
        const distance = Math.abs(diff);
        if (distance < 0.01) {
          t.currentDisplayedTemp = t.target;
          return;
        }
        const easing = 0.0002 + 0.005 / (distance + 1);
        t.currentDisplayedTemp += diff * easing;
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
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
    animateHumidity(index) {
      const t = this.thermostats[index];
      const step = () => {
        const diff = t.targetHumidity - t.humidityDisplayed;
        const distance = Math.abs(diff);
        if (distance < 0.05) {
          t.humidityDisplayed = t.targetHumidity;
          return;
        }
        const easing = 0.002 + 0.01 / (distance + 1);
        t.humidityDisplayed += diff * easing;
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  },
  mounted() {
    console.log('Thermostat component monté');
    window.addEventListener('device-selected', (e) => {
      this.visible = e.detail?.toLowerCase() === 'thermostat';
    });
  }
});
