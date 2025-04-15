// Création d'une instance Vue pour gérer l'affichage des consommations d'énergie


new Vue({
  el: '#energy-list', // Cible l'élément HTML avec l'ID 'energy-list'

  data: {
    // Liste des onglets (types d'énergie) disponibles avec leur script associé
    tabs: [
      { name: 'Eau', script: 'Eau.js', id: 'consommation-eau' },
      { name: 'Électricité', script: 'Electricite.js', id: 'consommation-electricite' }
    ],
    selectedTab: null 
  },

  mounted() {
    // Lors du montage de l'application, charger dynamiquement les scripts JS associés à chaque onglet
    this.tabs.forEach(tab => {
      const script = document.createElement('script'); // Crée un élément <script>
      script.src = `../functionalities/consumption/${tab.script}`; // Définit la source du script

      // Log une confirmation une fois le script chargé
      script.onload = () => console.log(`${tab.script} chargé`);

      // Affiche un avertissement si le chargement échoue
      script.onerror = () => console.warn(`Erreur chargement ${tab.script}`);

      // Ajoute le script au <head> du document
      document.head.appendChild(script);
    });

    // Écoute un événement personnalisé 'device-selected' pour mettre à jour l'onglet sélectionné
    window.addEventListener('device-selected', (e) => {
      this.selectedTab = e.detail;
    });
  },

  methods: {
    // Méthode pour sélectionner un onglet et afficher la modale de consommation
    selectTab(tab) {
      const event = new CustomEvent('device-selected', { detail: tab.name });
      window.dispatchEvent(event); // Déclenche l'événement avec le nom du périphérique sélectionné
      document.getElementById('backdrop-consommation').style.display = 'block'; // Affiche la modale
    },

    // Méthode pour fermer l'onglet et masquer la modale
    closeTab() {
      const event = new CustomEvent('device-selected', { detail: null });
      window.dispatchEvent(event); // Réinitialise la sélection
      document.getElementById('backdrop-consommation').style.display = 'none'; // Masque la modale
    },

    // Méthode pour normaliser les noms (ex. supprimer les accents et passer en minuscules)
    normalize(name) {
      return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }
  }
});
