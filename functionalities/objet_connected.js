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
            const normalizedId = this.normalize(device.name) + '-component';

            // Cacher tous les composants
            this.devices.forEach(d => {
                const id = this.normalize(d.name) + '-component';
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });

            // Afficher le composant sélectionné
            const selectedEl = document.getElementById(normalizedId);
            if (selectedEl) {
                selectedEl.style.display = 'block';
                document.getElementById('backdrop').style.display = 'block';
            } else {
                alert(`Composant HTML manquant pour ${device.name}`);
            }
        },
        closeDevice() {
            // Cacher tous les composants + backdrop
            this.devices.forEach(d => {
                const id = this.normalize(d.name) + '-component';
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });
            document.getElementById('backdrop').style.display = 'none';
        }
    }
});
