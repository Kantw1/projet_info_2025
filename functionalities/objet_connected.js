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
    methods: {
        selectDevice(device) {
            // Supprimer le script déjà chargé s’il existe
            const oldScript = document.getElementById('dynamic-device-script');
            if (oldScript) oldScript.remove();

            // Créer un nouveau <script> dynamique
            const script = document.createElement('script');
            script.src = `devices/${device.script}`; // dossier devices/
            script.id = 'dynamic-device-script';
            script.onload = () => {
                console.log(`Script ${device.script} chargé avec succès.`);
            };
            script.onerror = () => {
                alert(`Impossible de charger le script pour ${device.name}`);
            };

            document.body.appendChild(script);
        }
    }
});
