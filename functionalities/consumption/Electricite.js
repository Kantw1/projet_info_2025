// Electricite.js

new Vue({
    el: '#electricite-component',
    data: {
    visible: false,
    total: 82.4, // kWh
    moisActuel: new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' }),
    afficherDetails: false,
    afficherHistorique: false,
    objets: [
        { nom: 'Thermostat', conso: '42.1 kWh' },
        { nom: 'Lumières', conso: '29.5 kWh' },
        { nom: 'Panneau Solaire', conso: '10.8 kWh' }
    ]
    },
    mounted() {
        console.log("→ Composant Électricité monté");
        window.addEventListener('device-selected', (e) => {
            const selection = e.detail && e.detail.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            this.visible = selection === 'électricité' || selection === 'electricite';
        });
    }
});
