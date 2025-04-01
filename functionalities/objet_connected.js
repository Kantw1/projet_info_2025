new Vue({
    el: '#device-list',
    data: {
        devices: [
            { name: 'Thermostat', script: 'Thermostat.js' },
            { name: 'Caméra', script: 'Caméra.js' },
            { name: 'LumièreSalon', script: 'LumièreSalon.js' },
            { name: 'DétecteurMouvement', script: 'DétecteurMouvement.js' },
            { name: 'VoletRoulant', script: 'VoletRoulant.js' }
        ],
        selectedDevice: null,
        selectedScript: null
    },
    methods: {
        selectDevice(device) {
            this.selectedDevice = device;
            fetch(`../functionalities/devices/${device.script}`)
                .then(response => {
                    if (!response.ok) throw new Error('Erreur de chargement du script');
                    return response.text();
                })
                .then(scriptContent => {
                    this.selectedScript = scriptContent;
                })
                .catch(error => {
                    console.error(error);
                    alert(`Impossible de charger le script pour ${device.name}`);
                });
        },
        closeOverlay() {
            this.selectedScript = null;
            this.selectedDevice = null;
        }
    }
});