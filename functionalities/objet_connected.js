new Vue({
  el: '#device-list',
  data: {
      devices: []
  },
  mounted() {
    this.chargerDevices();
  },
  methods: {
    normalizeType(type) {
      const sansAccent = type.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const camel = sansAccent
        .toLowerCase()
        .split(/[_\s]/g)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      return `${camel}.js`;
    },
    
    formatNomAffiche(type) {
      const sansAccent = type.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return sansAccent
        .toLowerCase()
        .split(/[_\s]/g)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    },      
  
    chargerDevices() {
      fetch('../PHP_request/get_types_objets.php')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            this.devices = data.types.map(type => ({
              name: this.formatNomAffiche(type),
              script: this.normalizeType(type)
            }));
    
            // ✅ Console.log ici, APRES assignation
            console.log("📦 Devices chargés :", this.devices);
    
            // Charger les scripts dynamiquement
            this.devices.forEach(device => {
              const script = document.createElement('script');
              script.src = `../functionalities/devices/${device.script}`;
              script.onload = () => console.log(`${device.script} chargé`);
              script.onerror = () => console.warn(`Erreur chargement ${device.script}`);
              document.head.appendChild(script);
            });

            window.objetsConnectes = this.devices.map(d => ({
              nom: d.name,
              type: d.name.toLowerCase(), // ex: "thermostat"
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
      selectDevice(device) {
        const event = new CustomEvent('device-selected', { detail: device.name });
        window.dispatchEvent(event);
        document.getElementById('backdrop').style.display = 'block';
      },
      closeDevice() {
        const event = new CustomEvent('device-selected', { detail: null });
        window.dispatchEvent(event);
        document.getElementById('backdrop').style.display = 'none';
      }
    }
    
});
