new Vue({
    el: '#volet-roulant-component',
    data: {
      visible: false,
      modeSecurite: false,
      volets: [],
      consommationTotale: 0,
      derniereInteraction: 'Aucune',
      messageErreur: null,
      heuresDisponibles: [
        '00:00','00:30','01:00','01:30','02:00','02:30','03:00','03:30','04:00','04:30',
        '05:00','05:30','06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30',
        '10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30',
        '15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30',
        '20:00','20:30','21:00','21:30','22:00','22:30','23:00','23:30'
      ],
      heureGlobaleOuverture: '07:00',
      heureGlobaleFermeture: '21:00',
      derniereInteraction: 'Chargement en cours...',
      userType: '',
      erreurAutorisation: '',
    },
    mounted() {
      console.log('Volet roulant component monté');
      window.addEventListener('device-selected', (e) => {
        console.log('Événement reçu :', e.detail);
        this.visible = (e.detail && e.detail.toLowerCase() === 'volet roulant');
        console.log('→ volet-roulant visible =', this.visible);
        this.chargerVoletsDepuisServeur();
        this.chargerTypeUtilisateur();
      });
      
    
      this.lancerProgrammationHoraire();
      this.chargerVoletsDepuisServeur(); // <-- chargement dynamique ici
      this.chargerConsoMensuelle();
      this.chargerDerniereInteraction();
    },
    methods: {
      estAutorise(typesAutorises, action = '') {
        const autorise = typesAutorises.includes(this.userType);
        if (!autorise) {
          this.erreurAutorisation = `⛔ Action "${action}" non autorisée pour le rôle "${this.userType}"`;
          setTimeout(() => this.erreurAutorisation = '', 4000); // efface le message après 4 sec
        }
        return autorise;
      },
      chargerTypeUtilisateur() {
        fetch('../PHP_request/get_user_type.php')
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              this.userType = data.type;
              console.log("Type utilisateur :", this.userType);
            } else {
              console.warn("⚠️ Impossible de récupérer le type d'utilisateur :", data.error);
            }
          })
          .catch(err => {
            console.error("Erreur réseau type utilisateur :", err);
          });
      },      
      chargerDerniereInteraction() {
        fetch('../PHP_request/get_last_action_volet.php')
          .then(res => res.json())
          .then(data => {
            if (data.success && data.action && data.date_heure && data.user) {
              const date = new Date(data.date_heure);
              const dateStr = date.toLocaleDateString();
              const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              this.derniereInteraction = `${data.action} par ${data.user} le ${dateStr} à ${timeStr}`;
            } else {
              this.derniereInteraction = "Aucune action enregistrée";
            }
          })
          .catch(err => {
            console.error("Erreur chargement dernière interaction :", err);
            this.derniereInteraction = "Erreur lors du chargement";
          });
      },      
      connectiviteMoyenne() {
        const valeurs = {
          'Déconnecté': 0,
          'Signal faible': 1,
          'Signal moyen': 2,
          'Signal fort': 3
        };
      
        const valToLabel = {
          0: 'Déconnecté',
          1: 'Signal faible',
          2: 'Signal moyen',
          3: 'Signal fort'
        };
      
        const voletsConnectés = this.volets.filter(v => v.connectivity in valeurs);
        if (voletsConnectés.length === 0) return 'Aucune donnée';
      
        const somme = voletsConnectés.reduce((acc, v) => acc + valeurs[v.connectivity], 0);
        const moyenne = Math.round(somme / voletsConnectés.length);
      
        return valToLabel[moyenne];
      },      
      chargerConsoMensuelle() {
      fetch('../PHP_request/get_conso_volet_mois.php')
        .then(res => res.json())
        .then(data => {
          if (typeof data.total !== 'undefined') {
            this.consommationTotale = parseFloat(data.total);
            console.log("Conso mensuelle chargée :", data.total);
          } else {
            console.warn("Réponse conso invalide :", data);
          }
        })
        .catch(err => console.error("Erreur conso mensuelle :", err));
    },    
      appliquerProgrammationGlobale() {
        if (!this.estAutorise(['admin', 'Complexe utilisateur', 'Simple utilisateur'], 'Fermer volet')) return;
        this.volets.forEach(v => {
          if (v.connectivity !== 'Déconnecté') {
            v.heure_ouverture = this.heureGlobaleOuverture;
            v.heure_fermeture = this.heureGlobaleFermeture;
            this.enregistrerProgrammation(v);
          }
        });
        this.logInteraction("Programmation appliquée à tous les volets");
      },      
      enregistrerProgrammation(volet) {
        fetch('../PHP_request/set_programmation_volet.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: volet.id,
            ouverture: volet.heure_ouverture,
            fermeture: volet.heure_fermeture
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            this.logInteraction(`Programmation mise à jour pour ${volet.name}`);
          } else {
            this.afficherErreur("Erreur lors de l'enregistrement.");
          }
        });
      },      
      sauvegarderVolet(volet, action) {
        fetch('../PHP_request/update_volet_roulant.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: volet.id,
            position: volet.position,
            statut: volet.status,
            consommation: 0.15,
            action: action
          })
        })
        .then(response => response.json())
        .then(data => {
          if (!data.success) {
            console.error("Erreur sauvegarde volet :", data.error);
          }
        })
        .catch(error => {
          console.error("Erreur réseau :", error);
        });
      },      
      logInteraction(action) {
        const maintenant = new Date();
        this.derniereInteraction = `${action} - ${maintenant.toLocaleString()}`;
      },
      afficherErreur(message) {
        this.messageErreur = message;
        setTimeout(() => {
          this.messageErreur = null;
        }, 3000);
      },
      peutOuvrir(volet) {
        return volet.connectivity !== 'Déconnecté' && volet.position < 100;
      },
      peutFermer(volet) {
        return volet.connectivity !== 'Déconnecté' && volet.position > 0;
      },      
      ouvrirVolet(id) {
        if (!this.estAutorise(['admin', 'Complexe utilisateur', 'Simple utilisateur'], 'Ouvrir volet')) return;
        const volet = this.volets.find(v => v.id === id);
        if (!volet) return;
  
        if (volet.connectivity === 'Déconnecté') {
          this.afficherErreur(`${volet.name} est déconnecté. Action impossible.`);
          return;
        }
  
        volet.position = 100;
        volet.status = 'ouvert';
        this.consommationTotale += 0.15;
        this.logInteraction(`Ouverture de ${volet.name}`);
        this.sauvegarderVolet(volet, `Ouverture de ${volet.name}`);
      },
      fermerVolet(id) {
        if (!this.estAutorise(['admin', 'Complexe utilisateur', 'Simple utilisateur'], 'Fermer volet')) return;
        const volet = this.volets.find(v => v.id === id);
        if (!volet) return;
  
        if (volet.connectivity === 'Déconnecté') {
          this.afficherErreur(`${volet.name} est déconnecté. Action impossible.`);
          return;
        }
  
        volet.position = 0;
        volet.status = 'fermé';
        this.consommationTotale += 0.15;
        this.logInteraction(`Fermeture de ${volet.name}`);
        this.sauvegarderVolet(volet, `Fermeture de ${volet.name}`);
      },
      ajusterVolet(id, value) {
        if (!this.estAutorise(['admin', 'Complexe utilisateur', 'Simple utilisateur'], 'Ajuster volet')) return;
        const volet = this.volets.find(v => v.id === id);
        if (!volet) return;
  
        if (volet.connectivity === 'Déconnecté') {
          this.afficherErreur(`${volet.name} est déconnecté. Réglage impossible.`);
          return;
        }
  
        const val = parseInt(value);
        volet.position = Math.max(0, Math.min(100, val));
        volet.status = (val === 0) ? 'fermé' : (val === 100) ? 'ouvert' : 'partiellement ouvert';
        this.consommationTotale += 0.15;
        this.logInteraction(`Réglage de ${volet.name}`);
        this.sauvegarderVolet(volet, `Règlage de ${volet.name}`);
      },
      ouvrirTous() {
        if (!this.estAutorise(['admin', 'Complexe utilisateur', 'Simple utilisateur'], 'Ouvrir tous les volets')) return;
        this.volets.forEach(v => {
          if (v.connectivity !== 'Déconnecté') {
            v.position = 100;
            v.status = 'ouvert';
            this.consommationTotale += 0.15;
            this.logInteraction(`Ouverture de ${v.name}`);
            this.sauvegarderVolet(v, `Ouverture de ${v.name}`);
          } else {
            this.afficherErreur(`${v.name} est déconnecté. Action ignorée.`);
          }
        });
      },
      fermerTous() {
        if (!this.estAutorise(['admin', 'Complexe utilisateur', 'Simple utilisateur'], 'Fermer tous les volets')) return;
        this.volets.forEach(v => {
          if (v.connectivity !== 'Déconnecté') {
            v.position = 0;
            v.status = 'fermé';
            this.consommationTotale += 0.15;
            this.logInteraction(`Fermeture de ${v.name}`);
            this.sauvegarderVolet(v, `Fermeture de ${v.name}`);
          } else {
            this.afficherErreur(`${v.name} est déconnecté. Action ignorée.`);
          }
        });
      },
      toggleModeSecurite() {
        if (!this.estAutorise(['admin'], 'Activer/désactiver le mode sécurité')) return;
        // Vérifie l’état de l’alarme avant de basculer le mode sécurité
        fetch('../PHP_request/get_alarme.php')
          .then(res => res.json())
          .then(data => {
            if (!data.success) {
              console.warn("Impossible de vérifier l'état de l'alarme :", data.error);
              return;
            }
      
            if (!data.isActive) {
              alert("Vous devez d'abord activer l'alarme avant d'activer le mode sécurité.");
              return;
            }
      
            // Si alarme activée, on bascule le mode sécurité
            this.modeSecurite = !this.modeSecurite;
      
            if (this.modeSecurite) {
              // Appelle la BDD pour activer le mode sécurité
              fetch('../PHP_request/check_alarme_active.php')
                .then(res => res.json())
                .then(data => {
                  if (data.success) {
                    console.log(`Mode sécurité activé dans la BDD (${data.updated} volets mis à jour)`);
      
                    // Fermer tous les volets connectés
                    this.volets.forEach(v => {
                      if (v.connectivity !== 'Déconnecté') {
                        v.position = 0;
                        v.status = 'fermé';
                        this.consommationTotale += 0.15;
                        this.logInteraction(`Fermeture de ${v.name}`);
                        this.sauvegarderVolet(v, `Fermeture automatique (mode sécurité)`);
                      }
                    });
      
                    alert("Mode sécurité activé : tous les volets connectés ont été fermés.");
                  } else {
                    console.warn("Aucune mise à jour côté BDD :", data.message || data.error);
                  }
                })
                .catch(err => {
                  console.error("Erreur réseau lors de l'activation du mode sécurité :", err);
                });
            } else {
              alert("Mode sécurité désactivé.");
            }
          })
          .catch(err => {
            console.error("Erreur lors de la vérification de l'état de l'alarme :", err);
          });
      },            
      formatHeure(timeString) {
        if (!timeString) return '';
        const [h, m] = timeString.split(':');
        return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
      },      
      lancerProgrammationHoraire() {
        setInterval(() => {
          const maintenant = new Date();
          const heureActuelle = maintenant.toTimeString().slice(0, 5); // "HH:MM"
      
          this.volets.forEach(v => {
            if (v.connectivity !== 'Déconnecté') {
              // Fermeture toujours autorisée
              if (v.heure_fermeture === heureActuelle) {
                this.fermerVolet(v.id);
              }
      
              // Ouverture : vérifie mode sécurité
              if (v.heure_ouverture === heureActuelle) {
                if (!this.modeSecurite) {
                  this.ouvrirVolet(v.id);
                } else {
                  console.warn(`Ouverture bloquée par le mode sécurité pour ${v.name}`);
                  // 🔜 Ici tu pourras ajouter : if (alarmeDesactivee) { ... }
                }
              }
            }
          });
        }, 30000);
      },
      chargerVoletsDepuisServeur() {
        fetch('../PHP_request/get_volet_roulant.php')
          .then(response => response.json())
          .then(data => {
            if (Array.isArray(data)) {
              this.volets = data.map(volet => ({
                id: volet.id_objet_connecte,
                name: volet.nom_objet,
                location: volet.position,
                position: parseInt(volet.ouverture),
                status: volet.statut,
                connectivity: volet.connectivite,
                heure_ouverture: this.formatHeure(volet.heure_ouverture),
                heure_fermeture: this.formatHeure(volet.heure_fermeture)
              }));
                    
              // Initialise mode sécurité à partir du premier volet
              if (data.length > 0 && 'mode_securite' in data[0]) {
                this.modeSecurite = data[0].mode_securite === 1 || data[0].mode_securite === true;
              }
      
            } else {
              console.error("Format inattendu :", data);
            }
          })
          .catch(error => {
            console.error("Erreur lors du chargement des volets :", error);
          });
      }          
    }
  });
  