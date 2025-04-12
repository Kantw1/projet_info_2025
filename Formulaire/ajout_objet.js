// Formulaire/ajout_objet.js

new Vue({
    el: '#app',
    data: {
      objetsDisponibles: [],       // liste chargée depuis objet_connected.js
      objetsAjoutes: ['Thermostat', 'Panneau Solaire'], // simulé, à adapter plus tard
      selected: '',                // nom sélectionné
      message: ''
    },
    computed: {
      objetSelectionne() {
        return this.objetsDisponibles.find(obj => obj.nom === this.selected);
      }
    },
    mounted() {
      // Supposons que `window.objetsConnectes` est défini dans objet_connected.js
      if (window.objetsConnectes && Array.isArray(window.objetsConnectes)) {
        this.objetsDisponibles = window.objetsConnectes;
      } else {
        console.warn("Les objets connectés ne sont pas chargés.");
      }
    },
    methods: {
      ajouterObjet() {
        if (!this.selected) {
          this.message = "Veuillez sélectionner un objet.";
          return;
        }
        if (this.objetsAjoutes.includes(this.selected)) {
          this.message = "⚠️ Cet objet a déjà été ajouté.";
        } else {
          this.message = "✅ Objet ajouté avec succès.";
          this.objetsAjoutes.push(this.selected); // simulation ajout
        }
      },
      annuler() {
        window.location.href = "../AdminPage/admin.html"; // retour vers le dashboard
      }
    }
  });
  