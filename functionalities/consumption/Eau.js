//fichier Eau.js

new Vue({
    el: '#consommation-eau',
    data: {
    visible: false,
    totalEau: 1275, // temporaire
    afficherDetails: false,
    afficherHistorique: false,
    moisActuel: new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' }),
    objetsEau: [
        { nom: 'Arrosage', conso: '820 L' },
        { nom: 'Lave-linge', conso: '455 L' }
    ]
    },
    mounted() {
    console.log('💧 Composant Consommation Eau prêt');
    window.addEventListener('device-selected', (e) => {
        const selection = e.detail && e.detail.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
        this.visible = selection === 'eau';
    });
    }
});
  