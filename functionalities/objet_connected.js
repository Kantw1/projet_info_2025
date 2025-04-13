
new Vue({
  el: '#device-list',
  data: {
      devices: [
          { name: 'Thermostat', script: 'Thermostat.js' },
          { name: 'Panneau Solaire', script: 'PanneauSolaire.js' },
          { name: 'Lumiere', script: 'Lumiere.js' },
          { name: 'Alarme', script: 'Alarm.js' },
          { name: 'Arrosage', script: 'Arrosage.js' },
          { name: 'VoletRoulant', script: 'VoletRoulant.js' }
      ]
  },
  mounted() {
      this.devices.forEach(device => {
          const script = document.createElement('script');
          script.src = `../functionalities/devices/${device.script}`;
          script.onload = () => console.log(`${device.script} chargé`);
          script.onerror = () => console.warn(`Erreur chargement ${device.script}`);
          document.head.appendChild(script);
      });
      window.objetsConnectes = this.devices.map(d => ({
        nom: d.name,
        type: d.name.toLowerCase(), // ex: "thermostat"
        conso: d.name === 'Thermostat' ? '42.1 kWh' : '—',
        description: {
          'Thermostat': 'Régule automatiquement la température de la pièce.',
          'Panneau Solaire': 'Produit de l’énergie solaire à partir du soleil.',
          'Lumiere': 'Contrôle l’éclairage dans une pièce.',
          'Alarme': 'Détecte les intrusions et déclenche une alerte.',
          'Arrosage': 'Active automatiquement l’arrosage d’un jardin.',
          'VoletRoulant': 'Ouvre et ferme les volets motorisés.'
        }[d.name] || ''
      }));
      
  },
  methods: {
      normalize(name) {
        return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      },
      selectDevice(device) {
        const event = new CustomEvent('device-selected', { detail: device.name });
        window.dispatchEvent(event);
        document.getElementById('backdrop').style.display = 'block';
      },
      closeDevice() {
        const event = new CustomEvent('device-selected', { detail: null });
        window.dispatchEvent(event);
        document.getElementById('backdrop').style.display = 'none';
      }
    }
    
});