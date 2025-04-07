// PanneauSolaire component

new Vue({
    el: '#panneau-solaire-component',
    data: {
    visible: false,
    production: 3.2, // en kW
    capacite: 6.0, // en kWc
    consommation: 1.7, // en kW
    temperature: 24, // en °C
    tension: 230, // en V
    economieEuro: 18.7, // en €
    economieKWh: 26.4, // en kWh
    co2: 12.5, // en kg
    tauxUtilisation: 0.6, // 60% d'utilisation simulée
    derniereMiseAJour: '07/04/2025 10:58',
    etat: 'Actif',
    afficherEconomieEnKwh: false
    },
    methods: {
    // Basculer entre affichage € / kWh
    toggleAffichageEconomie() {
        this.afficherEconomieEnKwh = !this.afficherEconomieEnKwh;
    },

    // Mise à jour de la capacité (prompt pour l'instant)
    changerCapacite() {
        const nouvelle = parseFloat(prompt("Nouvelle capacité max (kWc) :", this.capacite));
        if (!isNaN(nouvelle) && nouvelle > 0) {
        this.capacite = nouvelle;
        }
    },

    //pour obtenir la date actuelle
    getDateActuelle() {
        const now = new Date();
        const date = now.toLocaleDateString('fr-FR');
        const heure = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        return `${date} ${heure}`;
    },

    // Activation/désactivation
    toggleEtat() {
        this.etat = this.etat === 'Actif' ? 'Inactif' : 'Actif';
    },
    
    //met a jour les modifs effectues
    changerCapacite() {
        const nouvelle = parseFloat(prompt("Nouvelle capacité max (kWc) :", this.capacite));
        if (!isNaN(nouvelle) && nouvelle > 0) {
        this.capacite = nouvelle;
        this.derniereMiseAJour = this.getDateActuelle(); // ✅ MAJ auto
        }
    },
    
    toggleEtat() {
        this.etat = this.etat === 'Actif' ? 'Inactif' : 'Actif';
        this.derniereMiseAJour = this.getDateActuelle(); // ✅ MAJ auto
    },

    getStatutColor() {
        switch (this.etat) {
        case 'Actif': return 'limegreen';
        case 'Inactif': return 'gray';
        default: return 'orange';
        }
    }
    },
    mounted() {
    console.log("→ Composant Panneau Solaire monté");
    window.addEventListener('device-selected', (e) => {
        const selection = e.detail && e.detail.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
        this.visible = selection === 'panneau solaire';
    });
    },
    computed: {
    consommationAffichee() {
        if (this.etat !== 'Actif') return '0.00';
        const consommation = this.production * this.tauxUtilisation;
        return consommation.toFixed(2);
    }
    }
});
  