
new Vue({
    el: '#arrosage-automatique-component',
    data: {
    visible: false,
    actif: true,
    humiditeSol: 42, // en %
    prochaineIrrigation: '07/04/2025 18:30',
    historique: [
        { date: '07/04/2025 07:00', duree: '15 min' },
        { date: '06/04/2025 18:00', duree: '10 min' },
        { date: '06/04/2025 07:00', duree: '12 min' }
    ],
    planning: ['07:30', '14:00', '18:00'],
    nouvelleHeure: ''
    },
    computed: {
    // 💧 Message dynamique selon humidité
    messageEtatSol() {
        if (this.humiditeSol >= 60) return '🌿 Sol bien hydraté';
        if (this.humiditeSol >= 30) return '🌱 Niveau d’humidité correct';
        return '⚠️ Arrosage nécessaire';
    },
    // 💧 Couleur selon humidité
    humiditeColor() {
        if (this.humiditeSol >= 60) return 'limegreen';
        if (this.humiditeSol >= 30) return 'orange';
        return 'crimson';
    }
    },
    methods: {
    toggleArrosage() {
        this.actif = !this.actif;
    },
    ajouterHeure() {
        const heure = this.nouvelleHeure.trim();
        if (/^\d{2}:\d{2}$/.test(heure) && !this.planning.includes(heure)) {
        this.planning.push(heure);
        this.nouvelleHeure = '';
        }
    },
    supprimerHeure(index) {
        this.planning.splice(index, 1);
    }
    },
    mounted() {
    console.log('→ Composant Arrosage Automatique monté');
    window.addEventListener('device-selected', (e) => {
        const selection = e.detail && e.detail.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
        this.visible = selection === 'arrosage';
    });
    }
});