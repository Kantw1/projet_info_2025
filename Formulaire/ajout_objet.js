new Vue({
  el: '#app',
  data: {
    objetsDisponibles: [
      { nom: "Thermostat", type: "thermostat" },
      { nom: "Panneau Solaire", type: "panneau_solaire" },
      { nom: "Lumiere", type: "lumiere" },
      { nom: "Alarme", type: "alarme" },
      { nom: "Arrosage", type: "arrosage" },
      { nom: "Volet Roulant", type: "volet_roulant" }
    ],
    objetSelectionne: null,
    etape: null,
    lieuxDisponibles: ["Salon", "Cuisine", "Chambre", "Salle de bain", "Garage", "Entrée", "Terrasse", "Jardin"],
    couleursOptions: ['Blanc', 'Jaune', 'Bleu', 'Rouge', 'Vert'],
    heuresDisponibles: [...Array(48).keys()].map(i => ("0"+Math.floor(i/2)).slice(-2)+":"+(i%2==0 ? "00" : "30")),

    configThermostat: { baseTemp: 20, nomUtilisateur: '', position: '' },
    configVolet: { heureOuverture: '07:00', heureFermeture: '21:00', positionInitiale: 0, nomUtilisateur: '', position: '' },
    configLumiere: { nomUtilisateur: '', emplacement: '', intensite: 100, couleur: 'Blanc' },
    configAlarme: { nomUtilisateur: '', emplacement: '', modeInitial: 'desactive', motDePasse: '' },
    configSolaire: { nomUtilisateur: '', emplacement: '', capacite: 3.0 },
    configArrosage: { nomUtilisateur: '', emplacement: '', planning: [], nouvelleHeure: '' },

    lieuxValidesParType: {
      thermostat: ['Salon', 'Chambre', 'Cuisine', 'Bureau', 'Salle de bain'],
      lumiere: ['Salon', 'Chambre', 'Cuisine', 'Salle de bain', 'Couloir', 'Entrée'],
      volet_roulant: ['Salon', 'Chambre', 'Cuisine'],
      alarme: ['Entrée', 'Garage', 'Jardin', 'Salon'],
      arrosage: ['Jardin', 'Terrasse'],
      panneau_solaire: ['Toit', 'Jardin']
    }
  },
  methods: {
    ouvrirOnglet(objet) {
      this.objetSelectionne = objet;
      this.etape = 'selection';
    },
    fermerOnglet() {
      this.objetSelectionne = null;
      this.etape = null;
    },
    getLieuParType(type) {
      switch (type) {
        case 'thermostat': return this.configThermostat.position;
        case 'volet_roulant': return this.configVolet.position;
        case 'lumiere': return this.configLumiere.emplacement;
        case 'alarme': return this.configAlarme.emplacement;
        case 'arrosage': return this.configArrosage.emplacement;
        case 'panneau_solaire': return this.configSolaire.emplacement;
        default: return '';
      }
    },
    ajouterHeureArrosage() {
      const heure = this.configArrosage.nouvelleHeure.trim();
      if (/^\d{2}:\d{2}$/.test(heure) && !this.configArrosage.planning.includes(heure)) {
        this.configArrosage.planning.push(heure);
        this.configArrosage.nouvelleHeure = '';
      }
    },
    retourAccueil() {
      window.location.href = "../AdminPage/admin.html";
    },
    configurerObjet() {
      const lieu = this.objetSelectionne.lieu?.trim() || '';
      if (!this.objetSelectionne) return;
      this.etape = 'configuration';
      const type = this.objetSelectionne.type;
      if (type === 'thermostat') this.configThermostat.position = lieu;
      if (type === 'volet_roulant') this.configVolet.position = lieu;
      if (type === 'lumiere') this.configLumiere.emplacement = lieu;
      if (type === 'alarme') this.configAlarme.emplacement = lieu;
      if (type === 'arrosage') this.configArrosage.emplacement = lieu;
      if (type === 'panneau_solaire') this.configSolaire.emplacement = lieu;
    },
    validerConfiguration() {
      const type = this.objetSelectionne?.type;
      if (!type) return;
    
      let config = {
        type: type,
        nom: this.objetSelectionne.nom ?? 'Objet connecté'
      };
    
      // Construction des données selon le type
      if (type === 'thermostat') {
        Object.assign(config, {
          baseTemp: this.configThermostat.baseTemp ?? 20,
          nomUtilisateur: this.configThermostat.nomUtilisateur ?? 'Thermostat',
          position: this.configThermostat.position ?? 'Salon'
        });
      }
    
      if (type === 'volet_roulant') {
        Object.assign(config, {
          nomUtilisateur: this.configVolet.nomUtilisateur ?? 'Volet',
          position: this.configVolet.position ?? 'Salon',
          heureOuverture: this.configVolet.heureOuverture ?? '07:00',
          heureFermeture: this.configVolet.heureFermeture ?? '21:00',
          positionInitiale: this.configVolet.positionInitiale ?? 0
        });
      }
    
      if (type === 'lumiere') {
        Object.assign(config, {
          nomUtilisateur: this.configLumiere.nomUtilisateur ?? 'Lampe',
          emplacement: this.configLumiere.emplacement ?? 'Salon',
          intensite: this.configLumiere.intensite ?? 100,
          couleur: this.configLumiere.couleur ?? 'Blanc'
        });
      }
    
      if (type === 'alarme') {
        Object.assign(config, {
          nomUtilisateur: this.configAlarme.nomUtilisateur ?? 'Alarme principale',
          emplacement: this.configAlarme.emplacement ?? 'Entrée',
          modeInitial: this.configAlarme.modeInitial ?? 'desactive',
          motDePasse: this.configAlarme.motDePasse ?? '0000'
        });
      }
    
      if (type === 'panneau_solaire') {
        Object.assign(config, {
          nomUtilisateur: this.configSolaire.nomUtilisateur ?? 'Panneau',
          emplacement: this.configSolaire.emplacement ?? 'Toit',
          capacite: this.configSolaire.capacite ?? 3.0
        });
      }
    
      if (type === 'arrosage') {
        Object.assign(config, {
          nomUtilisateur: this.configArrosage.nomUtilisateur ?? 'Arrosage',
          emplacement: this.configArrosage.emplacement ?? 'Jardin',
          planning: Array.isArray(this.configArrosage.planning) ? this.configArrosage.planning : []
        });
      }
    
      // Debug : voir ce qui est réellement envoyé
      console.log("📦 JSON envoyé :", JSON.stringify(config, null, 2));
    
      // Envoi au serveur PHP
      fetch('../PHP_request/enregistrer_objet.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          alert("✅ Objet bien enregistré !");
          this.fermerOnglet();
        } else {
          alert("❌ Erreur côté serveur : " + result.message);
        }
      })
      .catch(err => {
        console.error("💥 Erreur réseau :", err);
        alert("❌ Impossible de joindre le serveur.");
      });
    }    
  }
});