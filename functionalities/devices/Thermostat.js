new Vue({
    el: '#thermostat-component',
    data: {
      visible: false,
      dragging: false,
      thermostat: {
        name: 'Thermostat',
        temp: 22.3,
        target: 23.0,
        energy: 66
      },
      targetHumidity: 54,
      humidityDisplayed: 54,
      minTemp: 10,
      maxTemp: 30,
      radius: 80,
      currentDisplayedTemp: 22.3, // Pour animation
      animationInterval: null,
      tempPreview: null,
      baseTemp: 20,
    baseHumidity: 50,
    electricityConsumption: 0

    },
    computed: {
      circumference() {
        return 2 * Math.PI * this.radius;
      },
      dashOffset() {
        const ratio = (this.thermostat.target - this.minTemp) / (this.maxTemp - this.minTemp);
        return this.circumference * (1 - ratio);
      },
      displayTemp() {
        return this.currentDisplayedTemp.toFixed(1);
      },
      calculatedEnergy() {
        const tempImpact = Math.max(0, this.currentDisplayedTemp - this.baseTemp) * 1.5;
        const humidityImpact = Math.max(0, this.humidityDisplayed - this.baseHumidity) * 0.5;
        return (tempImpact + humidityImpact).toFixed(1);
      }      
    },
    mounted() {
      console.log('Thermostat component monté');
      window.addEventListener('device-selected', (e) => {
        console.log('Événement reçu :', e.detail);
        this.visible = (e.detail && e.detail.toLowerCase() === 'thermostat');
        console.log('→ visible =', this.visible);
      });
    },
    methods: {
      clickToUpdateTemperature(e) {
        this.updateTemperature(e);
      },
      startDrag(e) {
        this.dragging = true;
        this.updateTargetFromEvent(e);
      },
      onDrag(e) {
        if (this.dragging) {
          this.updateTargetFromEvent(e); // met à jour la jauge pendant le drag
        }
      },
      endDrag() {
        this.dragging = false;
        this.animateTemperature(); // anime vers la dernière valeur visée
      },
      animateTemperature() {
        const step = () => {
          const diff = this.thermostat.target - this.currentDisplayedTemp;
          const distance = Math.abs(diff);
      
          if (distance < 0.01) {
            this.currentDisplayedTemp = this.thermostat.target;
            return;
          }
      
          const easing = 0.0002 + 0.005 / (distance + 1); // ralentissement progressif
          this.currentDisplayedTemp += diff * easing;
      
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
      updateTargetFromEvent(e) {
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        angle = (angle + 360 + 90) % 360;
        const newTarget = Math.round(this.minTemp + (angle / 360) * (this.maxTemp - this.minTemp));
        this.thermostat.target = newTarget; // met à jour en direct
      },
      adjustHumidity(delta) {
        const newTarget = Math.max(0, Math.min(100, this.targetHumidity + delta));
        this.targetHumidity = newTarget;
        this.animateHumidity();
      },
      animateHumidity() {
        const step = () => {
          const diff = this.targetHumidity - this.humidityDisplayed;
          const distance = Math.abs(diff);
      
          if (distance < 0.05) {
            this.humidityDisplayed = this.targetHumidity;
            return;
          }
      
          const easing = 0.002 + 0.01 / (distance + 1); // ralentissement progressif
          this.humidityDisplayed += diff * easing;
      
          requestAnimationFrame(step);
        };
      
        requestAnimationFrame(step);
      }            
           
    }
  });
  