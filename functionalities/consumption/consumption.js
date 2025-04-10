new Vue({
    el: '#conso',
    data: {
      activeTab: 'eau', // par defaut
      afficherDetails: false,
      afficherHistorique: false,
      totalEau: 1275, // exemple
      totalElec: 82.4, // exemple
      moisActuel: new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' }),
      objetsEau: [
        { nom: 'Arrosage', conso: '820 L' },
        { nom: 'Lave-linge', conso: '455 L' }
      ],
      objetsElec: [
        { nom: 'Thermostat', conso: '42.1 kWh' },
        { nom: 'Lumières', conso: '29.5 kWh' },
        { nom: 'Panneau Solaire', conso: '10.8 kWh' }
      ]
    },
    mounted() {
      // Setup des graphes si nécessaire plus tard (Chart.js)
      console.log('Composant consommation chargé');
    }
  });
  