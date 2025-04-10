// Electricite.js

new Vue({
    el: '#consommation-electricite',
    data: {
    visible: false,
    total: 82.4,
    afficherDetails: false,
    afficherHistorique: false,
    moisActuel: new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' }),
    objets: [
        { nom: 'Thermostat', conso: '42.1 kWh' },
        { nom: 'Lumières', conso: '29.5 kWh' },
        { nom: 'Panneau Solaire', conso: '10.8 kWh' }
    ]
    },
    mounted() {
    console.log("→ Composant Électricité monté");
    window.addEventListener('device-selected', (e) => {
        const selection = e.detail && e.detail.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
        this.visible = selection === 'electricite';
    });
    }
});
  