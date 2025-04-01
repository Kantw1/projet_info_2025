new Vue({
    el: '#device-list',
    data: {
        devices: [
            { name: 'Thermostat', status: 'Actif' },
            { name: 'Caméra de sécurité', status: 'Inactif' },
            { name: 'Lumière du salon', status: 'Actif' },
            { name: 'Détecteur de mouvement', status: 'Inactif' },
            { name: 'Volet roulant', status: 'Actif' }
        ]
    },
    methods: {
        selectDevice(device) {
            alert(`Appareil sélectionné : ${device.name} (${device.status})`);
        }
    }
});
