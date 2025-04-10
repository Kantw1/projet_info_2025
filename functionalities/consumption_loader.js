// fichier : functionalities/consumption_loader.js

new Vue({
  el: '#energy-list',
  data: {
    tabs: [
      { name: 'Eau', script: 'Eau.js', id: 'consommation-eau' },
      { name: 'Électricité', script: 'Electricite.js', id: 'consommation-electricite' }
    ]
  },
  mounted() {
    this.tabs.forEach(tab => {
      const script = document.createElement('script');
      script.src = `../functionalities/consumption/${tab.script}`;
      script.onload = () => console.log(`${tab.script} chargé`);
      script.onerror = () => console.warn(`Erreur chargement ${tab.script}`);
      document.head.appendChild(script);
    });
  },
  methods: {
    normalize(name) {
      return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    },
    selectTab(tab) {
      const event = new CustomEvent('device-selected', { detail: tab.name });
      window.dispatchEvent(event);
      document.getElementById('backdrop').style.display = 'block';
    },
    closeTab() {
      const event = new CustomEvent('device-selected', { detail: null });
      window.dispatchEvent(event);
      document.getElementById('backdrop').style.display = 'none';
    }
  }
});
