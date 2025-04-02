new Vue({
    el: '#device-list',
    data: {
        devices: [
            { name: 'Thermostat', script: 'Thermostat.js' },
            { name: 'Caméra', script: 'Caméra.js' },
            { name: 'LumièreSalon', script: 'LumièreSalon.js' },
            { name: 'DétecteurMouvement', script: 'DétecteurMouvement.js' },
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
