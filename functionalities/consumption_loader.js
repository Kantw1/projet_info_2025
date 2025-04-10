// fichier consumtion loader.js

new Vue({
  el: '#energy-list',
  data: {
    tabs: [
      { name: 'Eau', script: 'Eau.js', id: 'consommation-eau' },
      { name: 'Électricité', script: 'Electricite.js', id: 'consommation-electricite' }
    ],
    selectedTab: null
  },
  mounted() {
    this.tabs.forEach(tab => {
      const script = document.createElement('script');
      script.src = `../functionalities/consumption/${tab.script}`;
      script.onload = () => console.log(`${tab.script} chargé`);
      script.onerror = () => console.warn(`Erreur chargement ${tab.script}`);
      document.head.appendChild(script);
    });

    window.addEventListener('device-selected', (e) => {
      this.selectedTab = e.detail;
    });
  },
  methods: {
    selectTab(tab) {
      const event = new CustomEvent('device-selected', { detail: tab.name });
      window.dispatchEvent(event);
      document.getElementById('backdrop-consommation').style.display = 'block';
    },
    closeTab() {
      const event = new CustomEvent('device-selected', { detail: null });
      window.dispatchEvent(event);
      document.getElementById('backdrop-consommation').style.display = 'none';
    },
    normalize(name) {
      return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }
  }
});