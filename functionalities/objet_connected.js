// Création d'une instance Vue qui gère la liste des objets connectés


new Vue({
  el: '#device-list', // Point d'ancrage de l'application dans le DOM

  data: {
    // Liste des appareils connectés (remplie dynamiquement après chargement)
    devices: []
  },

  mounted() {
    // Appelé automatiquement au montage du composant : lance le chargement des appareils
    this.chargerDevices();
  },

  methods: {

    // Transforme un type brut en nom de script JS (ex: "volet_roulant" → "VoletRoulant.js")
    normalizeType(type) {
      const sansAccent = type.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const camel = sansAccent
        .toLowerCase()
        .split(/[_\s]/g)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      return `${camel}.js`;
    },

    // Formate un nom brut pour l'affichage (ex: "volet_roulant" → "Volet Roulant")
    formatNomAffiche(type) {
      const sansAccent = type.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return sansAccent
        .toLowerCase()
        .split(/[_\s]/g)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    },

    // Récupère les types d'objets via une requête fetch + charge dynamiquement les scripts
    chargerDevices() {
      fetch('../PHP_request/get_types_objets.php')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            // Formatage des objets à partir des types reçus
            this.devices = data.types.map(type => ({
              name: this.formatNomAffiche(type),
              script: this.normalizeType(type)
            }));

            console.log("📦 Devices chargés :", this.devices);

            // Chargement des scripts associés à chaque appareil
            this.devices.forEach(device => {
              const script = document.createElement('script');
              script.src = `../functionalities/devices/${device.script}`;
              script.onload = () => console.log(`${device.script} chargé`);
              script.onerror = () => console.warn(`Erreur chargement ${device.script}`);
              document.head.appendChild(script);
            });

            // Rend visible dynamiquement chaque section HTML liée à un objet
            this.devices.forEach(d => {
              const id = 'over' + d.name.replace(/\s/g, '');
              const el = document.getElementById(id);
              if (el) {
                el.style.display = 'block';
                el.style.visibility = 'visible';
                el.style.opacity = '1';
                el.style.height = 'auto';
                el.style.width = '100%';
                el.style.pointerEvents = 'auto';
              }
            });

            // Création d'une variable globale contenant les infos des objets pour d'autres usages
            window.objetsConnectes = this.devices.map(d => ({
              nom: d.name,
              type: d.name.toLowerCase(),
              conso: d.name === 'Thermostat' ? '42.1 kWh' : '—',
              description: {
                'Thermostat': 'Régule automatiquement la température de la pièce.',
                'Panneau Solaire': 'Produit de l’énergie solaire à partir du soleil.',
                'Lumiere': 'Contrôle l’éclairage dans une pièce.',
                'Alarme': 'Détecte les intrusions et déclenche une alerte.',
                'Arrosage': 'Active automatiquement l’arrosage d’un jardin.',
                'Volet Roulant': 'Ouvre et ferme les volets motorisés.'
              }[d.name] || ''
            }));

          } else {
            console.error("❌ Erreur chargement des types :", data.error);
          }
        })
        .catch(err => {
          console.error("❌ Erreur réseau :", err);
        });
    },

    // Méthode déclenchée lors de la sélection d’un appareil : affiche la modale
    selectDevice(device) {
      const event = new CustomEvent('device-selected', { detail: device.name });
      window.dispatchEvent(event);
      document.getElementById('backdrop').style.display = 'block';
    },

    // Ferme la modale de l'appareil sélectionné
    closeDevice() {
      const event = new CustomEvent('device-selected', { detail: null });
      window.dispatchEvent(event);
      document.getElementById('backdrop').style.display = 'none';
    }

  }
});
