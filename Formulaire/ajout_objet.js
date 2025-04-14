new Vue({
    el: '#app',
    data: {
      objetsDisponibles: [],
      objetSelectionne: null,
      lieuxDisponibles: [
        "Salon", "Cuisine", "Chambre", "Salle de bain", "Garage", "Entrée", "Terrasse", "Jardin"
      ],
      etape: null, // 'selection' ou 'configuration'
  
      // datas de Thermostat
      configThermostat: {
        baseTemp: 20,
        nomUtilisateur: '',
        position: ''
      },

      // les datas de Lumiere

      heuresDisponibles: [
        '00:00','00:30','01:00','01:30','02:00','02:30','03:00','03:30','04:00','04:30',
        '05:00','05:30','06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30',
        '10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30',
        '15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30',
        '20:00','20:30','21:00','21:30','22:00','22:30','23:00','23:30'
      ],
      
      configVolet: {
        heureOuverture: '07:00',
        heureFermeture: '21:00',
        positionInitiale: 0,
        nomUtilisateur: '',
        position: ''
      },

      // les datas de Lumiere

      configLumiere: {
        nomUtilisateur: '',
        emplacement: '',
        intensite: 100,
        couleur: 'Blanc'
      },
      
      couleursOptions: ['Blanc', 'Jaune', 'Bleu', 'Rouge', 'Vert'],      
      
      // les datas de lalarme

      configAlarme: {
        nomUtilisateur: '',
        emplacement: '',
        modeInitial: 'desactive',
        motDePasse: ''
      },

      // les datas de PanneauSolaire

      configSolaire: {
        nomUtilisateur: '',
        emplacement: '',
        capacite: 3.0
      },

      //les trucs datas pour arrosage

      configArrosage: {
        nomUtilisateur: '',
        emplacement: '',
        planning: [],
        nouvelleHeure: ''
      },
      
      lieuxValidesParType: {
        thermostat: ['Salon', 'Chambre', 'Cuisine', 'Bureau', 'Salle de bain'],
        lumiere: ['Salon', 'Chambre', 'Cuisine', 'Salle de bain', 'Couloir', 'Entrée'],
        voletroulant: ['Salon', 'Chambre', 'Cuisine'],
        alarme: ['Entrée', 'Garage', 'Jardin', 'Salon'],
        arrosage: ['Jardin', 'Terrasse'],
        'panneau solaire': ['Toit', 'Jardin']
      },
      
    },
    mounted() {
      // 🔄 Compléter les objets avec conso réelle + source si possible
      const consoReelleMap = {
        'thermostat': {
          consoReelle: '20–40 kWh/an',
          source: 'selectra.info/domotique/guides/energie/economies'
        },
        'panneau solaire': {
          consoReelle: 'Produit ~1000 kWh/an par kWc',
          source: 'selectra.info/domotique/guides/energie/economies'
        },
        'lumiere': {
          consoReelle: '50–100 kWh/an',
          source: 'selectra.info/domotique/guides/energie/economies'
        },
        'alarme': {
          consoReelle: '10–20 kWh/an',
          source: 'selectra.info/domotique/guides/energie/economies'
        },
        'arrosage': {
          consoReelle: '5–10 kWh/an (électrique)',
          source: 'selectra.info/domotique/guides/energie/economies'
        },
        'voletroulant': {
          consoReelle: '5,5–13,5 kWh/an',
          source: 'volet-system.com/content/52-consommation-electrique-volet-roulant'
        }
      };

      // Données statiques pour tous les objets
      this.objetsDisponibles = [
        { nom: "Thermostat", type: "thermostat" },
        { nom: "Panneau Solaire", type: "panneau solaire" },
        { nom: "Lumiere", type: "lumiere" },
        { nom: "Alarme", type: "alarme" },
        { nom: "Arrosage", type: "arrosage" },
        { nom: "Volet Roulant", type: "voletroulant" }
      ];

      const lieuxValidesParType = {
        thermostat: ['Salon', 'Chambre', 'Cuisine', 'Bureau', 'Salle de bain'],
        lumiere: ['Salon', 'Chambre', 'Cuisine', 'Salle de bain', 'Couloir', 'Entrée'],
        voletroulant: ['Salon', 'Chambre', 'Cuisine'],
        alarme: ['Entrée', 'Garage', 'Jardin', 'Salon'],
        arrosage: ['Jardin', 'Terrasse'],
        panneauxolaire: ['Toit', 'Jardin']
      };
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
          case 'voletroulant': return this.configVolet.position;
          case 'lumiere': return this.configLumiere.emplacement;
          case 'alarme': return this.configAlarme.emplacement;
          case 'arrosage': return this.configArrosage.emplacement;
          case 'panneau solaire': return this.configSolaire.emplacement;
          default: return '';
        }
      },

      ajouterHeureArrosage() { //pour ajouter les dates 
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
        if (!this.objetSelectionne) return;
        this.etape = 'configuration';

        // On récupère le lieu tapé dans la vue de sélection
        const lieuSaisi = this.objetSelectionne.lieu?.trim() || '';

        // Et on le transfère vers les bons champs selon le type
        switch (this.objetSelectionne.type) {
          case 'thermostat':
            this.configThermostat.baseTemp = 20;
            this.configThermostat.position = lieuSaisi;
            break;
          case 'voletroulant':
            this.configVolet.position = lieuSaisi;
            break;
          case 'lumiere':
            this.configLumiere.emplacement = lieuSaisi;
            break;
          case 'alarme':
            this.configAlarme.emplacement = lieuSaisi;
            break;
          case 'arrosage':
            this.configArrosage.emplacement = lieuSaisi;
            break;
          case 'panneau solaire':
            this.configSolaire.emplacement = lieuSaisi;
            break;
        }
      },

      validerConfiguration() {
        if (!this.objetSelectionne) return;

        const type = this.objetSelectionne.type.toLowerCase();
        let config = {}; // 👉 Ce sera le payload à envoyer au backend

        // 🎯 Construction du config selon le type
        if (type === 'thermostat') {
          config = {
            type: type,
            nom: this.objetSelectionne.nom,
            baseTemp: this.configThermostat.baseTemp,
            nomUtilisateur: this.configThermostat.nomUtilisateur,
            position: this.configThermostat.position
          };
        }

        if (type === 'voletroulant') {
          config = {
            type: type,
            nom: this.objetSelectionne.nom,
            nomUtilisateur: this.configVolet.nomUtilisateur,
            position: this.configVolet.position,
            heureOuverture: this.configVolet.heureOuverture,
            heureFermeture: this.configVolet.heureFermeture,
            positionInitiale: this.configVolet.positionInitiale
          };
        }

        if (type === 'lumiere') {
          config = {
            type: type,
            nom: this.objetSelectionne.nom,
            nomUtilisateur: this.configLumiere.nomUtilisateur,
            emplacement: this.configLumiere.emplacement,
            intensite: this.configLumiere.intensite,
            couleur: this.configLumiere.couleur
          };
        }

        if (type === 'alarme') {
          config = {
            type: type,
            nom: this.objetSelectionne.nom,
            nomUtilisateur: this.configAlarme.nomUtilisateur,
            emplacement: this.configAlarme.emplacement,
            modeInitial: this.configAlarme.modeInitial,
            motDePasse: this.configAlarme.motDePasse
          };
        }

        if (type === 'panneau') {
          config = {
            type: type,
            nom: this.objetSelectionne.nom,
            nomUtilisateur: this.configSolaire.nomUtilisateur,
            emplacement: this.configSolaire.emplacement,
            capacite: this.configSolaire.capacite
          };
        }

        if (type === 'arrosage') {
          config = {
            type: type,
            nom: this.objetSelectionne.nom,
            nomUtilisateur: this.configArrosage.nomUtilisateur,
            emplacement: this.configArrosage.emplacement,
            planning: this.configArrosage.planning
          };
        }

        // 📍 Validation du lieu (doit faire partie des lieux autorisés)
        const lieu = this.getLieuParType(type)?.trim();
        const lieuxPossibles = this.lieuxValidesParType[type] || [];
        const estValide = lieuxPossibles.some(l => lieu?.toLowerCase().includes(l.toLowerCase()));

        if (!estValide) {
          alert(`🚫 Le lieu "${lieu}" ne semble pas adapté pour un ${type}. Lieux autorisés : ${lieuxPossibles.join(', ')}`);
          return;
        }

        // ✅ Vérification des champs obligatoires
        const champsObligatoires = {
          thermostat: [this.configThermostat.baseTemp, this.configThermostat.nomUtilisateur, this.configThermostat.position],
          lumiere: [this.configLumiere.nomUtilisateur, this.configLumiere.emplacement, this.configLumiere.intensite, this.configLumiere.couleur],
          voletroulant: [this.configVolet.nomUtilisateur, this.configVolet.position, this.configVolet.heureOuverture, this.configVolet.heureFermeture, this.configVolet.positionInitiale],
          alarme: [this.configAlarme.nomUtilisateur, this.configAlarme.emplacement, this.configAlarme.modeInitial, this.configAlarme.motDePasse],
          panneauxolaire: [this.configSolaire.nomUtilisateur, this.configSolaire.emplacement, this.configSolaire.capacite],
          arrosage: [this.configArrosage.nomUtilisateur, this.configArrosage.emplacement]
        };

        const champs = champsObligatoires[type] || [];
        const tousRemplis = champs.every(val => val !== null && val !== '' && val !== undefined);

        if (!tousRemplis) {
          alert("⚠️ Merci de remplir tous les champs obligatoires pour cet objet !");
          return;
        }

        // ENVOI vers PHP avec fetch
        fetch('../PHP_request/enregistrer_objet.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(config)
        })
        .then(res => res.json())
        .then(result => {
          console.log("📨 Réponse serveur :", result);
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
  