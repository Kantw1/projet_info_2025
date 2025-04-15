// VoletRoulant.js


// Composant Vue.js pour la gestion des volets roulant


new Vue({
  el: '#volet-roulant-component', // Définir l'élément DOM auquel ce composant Vue est lié
  data: {
    visible: false,
    modeSecurite: false,
    volets: [],
    consommationTotale: 0,
    derniereInteraction: 'Aucune',
    messageErreur: null,
    heuresDisponibles: [ /* Liste des heures disponibles pour la programmation des volets */],
    heureGlobaleOuverture: '07:00', 
    heureGlobaleFermeture: '21:00', 
    userType: '', 
    erreurAutorisation: '',
  },
  mounted() {
    console.log('Volet roulant component monté'); // Log lorsque le composant est monté
    window.addEventListener('device-selected', (e) => { // Écoute l'événement 'device-selected'
      console.log('Événement reçu :', e.detail);
      this.visible = (e.detail && e.detail.toLowerCase() === 'volet roulant'); // Change la visibilité en fonction du périphérique sélectionné
      console.log('→ volet-roulant visible =', this.visible);
      this.chargerVoletsDepuisServeur(); // Charge les volets depuis le serveur
      this.chargerTypeUtilisateur(); // Charge le type d'utilisateur
    });

    // Initialisation des processus
    this.lancerProgrammationHoraire(); // Lance la programmation horaire des volets
    this.chargerVoletsDepuisServeur(); // Charge les volets depuis le serveur
    this.chargerConsoMensuelle(); // Charge la consommation mensuelle
    this.chargerDerniereInteraction(); // Charge la dernière interaction
  },
  methods: {
    // Vérifie si l'utilisateur est autorisé à effectuer une action
    estAutorise(typesAutorises, action = '') {
      const autorise = typesAutorises.includes(this.userType); // Vérifie si le type d'utilisateur est autorisé
      if (!autorise) {
        this.erreurAutorisation = `⛔ Action "${action}" non autorisée pour le rôle "${this.userType}"`; // Affiche un message d'erreur
        setTimeout(() => this.erreurAutorisation = '', 4000); // Efface le message après 4 secondes
      }
      return autorise; // Retourne vrai ou faux selon l'autorisation
    },
    
    // Charge le type d'utilisateur à partir du serveur
    chargerTypeUtilisateur() {
      fetch('../PHP_request/get_user_type.php') // Requête pour obtenir le type d'utilisateur
        .then(res => res.json()) // Convertit la réponse en JSON
        .then(data => {
          if (data.success) {
            this.userType = data.type; // Définit le type d'utilisateur
            console.log("Type utilisateur :", this.userType);
          } else {
            console.warn("⚠️ Impossible de récupérer le type d'utilisateur :", data.error); // Affiche un avertissement si la récupération échoue
          }
        })
        .catch(err => {
          console.error("Erreur réseau type utilisateur :", err); // Log l'erreur en cas de problème réseau
        });
    },

    // Charge la dernière interaction effectuée avec les volets
    chargerDerniereInteraction() {
      fetch('../PHP_request/get_last_action_volet.php') // Requête pour obtenir la dernière action des volets
        .then(res => res.json()) // Convertit la réponse en JSON
        .then(data => {
          if (data.success && data.action && data.date_heure && data.user) {
            const date = new Date(data.date_heure); // Crée un objet Date à partir de la date/heure reçue
            const dateStr = date.toLocaleDateString(); // Formate la date
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Formate l'heure
            this.derniereInteraction = `${data.action} par ${data.user} le ${dateStr} à ${timeStr}`; // Affiche l'interaction
          } else {
            this.derniereInteraction = "Aucune action enregistrée"; // Si aucune action, affiche un message
          }
        })
        .catch(err => {
          console.error("Erreur chargement dernière interaction :", err); // Log l'erreur en cas de problème
          this.derniereInteraction = "Erreur lors du chargement"; // Affiche un message d'erreur
        });
    },

    // Calcule la connectivité moyenne des volets
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

      const voletsConnectés = this.volets.filter(v => v.connectivity in valeurs); // Filtre les volets connectés
      if (voletsConnectés.length === 0) return 'Aucune donnée'; // Retourne 'Aucune donnée' si aucun volet connecté

      const somme = voletsConnectés.reduce((acc, v) => acc + valeurs[v.connectivity], 0); // Calcule la somme des valeurs de connectivité
      const moyenne = Math.round(somme / voletsConnectés.length); // Calcule la moyenne de connectivité

      return valToLabel[moyenne]; // Retourne le label correspondant à la moyenne
    },

    // Charge la consommation mensuelle des volets depuis le serveur
    chargerConsoMensuelle() {
      fetch('../PHP_request/get_conso_volet_mois.php')
        .then(res => res.json())
        .then(data => {
          if (typeof data.total !== 'undefined') {
            this.consommationTotale = parseFloat(data.total); // Définit la consommation totale
            console.log("Conso mensuelle chargée :", data.total);
          } else {
            console.warn("Réponse conso invalide :", data); // Affiche un avertissement si la réponse est invalide
          }
        })
        .catch(err => console.error("Erreur conso mensuelle :", err)); // Log l'erreur en cas de problème
    },

    // Applique une programmation globale pour tous les volets
    appliquerProgrammationGlobale() {
      if (!this.estAutorise(['admin', 'Complexe utilisateur', 'Simple utilisateur'], 'Fermer volet')) return; // Vérifie l'autorisation
      this.volets.forEach(v => { // Applique la programmation à chaque volet
        if (v.connectivity !== 'Déconnecté') { // Si le volet est connecté
          v.heure_ouverture = this.heureGlobaleOuverture; // Définit l'heure d'ouverture
          v.heure_fermeture = this.heureGlobaleFermeture; // Définit l'heure de fermeture
          this.enregistrerProgrammation(v); // Enregistre la programmation
        }
      });
      this.logInteraction("Programmation appliquée à tous les volets"); // Log l'interaction
    },

    // Enregistre la programmation d'un volet dans la base de données
    enregistrerProgrammation(volet) {
      fetch('../PHP_request/set_programmation_volet.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: volet.id, // Identifiant du volet
          ouverture: volet.heure_ouverture, // Heure d'ouverture
          fermeture: volet.heure_fermeture // Heure de fermeture
        })
      })
      .then(res => res.json()) // Convertit la réponse en JSON
      .then(data => {
        if (data.success) {
          this.logInteraction(`Programmation mise à jour pour ${volet.name}`); // Log la réussite
        } else {
          this.afficherErreur("Erreur lors de l'enregistrement."); // Affiche une erreur si l'enregistrement échoue
        }
      });
    },

    // Enregistre l'état d'un volet dans la base de données
    sauvegarderVolet(volet, action) {
      fetch('../PHP_request/update_volet_roulant.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: volet.id, // Identifiant du volet
          position: volet.position, // Position du volet
          statut: volet.status, // Statut du volet (ouvert/fermé)
          consommation: 0.15, // Consommation d'énergie
          action: action // Action effectuée
        })
      })
      .then(response => response.json()) // Convertit la réponse en JSON
      .then(data => {
        if (!data.success) {
          console.error("Erreur sauvegarde volet :", data.error); // Log l'erreur en cas d'échec
        }
      })
      .catch(error => {
        console.error("Erreur réseau :", error); // Log l'erreur réseau
      });
    },

    // Log l'interaction effectuée avec le volet
    logInteraction(action) {
      const maintenant = new Date(); // Crée un objet Date pour l'heure actuelle
      this.derniereInteraction = `${action} - ${maintenant.toLocaleString()}`; // Définit le message de dernière interaction
    },

    // Affiche un message d'erreur temporaire
    afficherErreur(message) {
      this.messageErreur = message; // Définit le message d'erreur
      setTimeout(() => {
        this.messageErreur = null; // Efface le message après 3 secondes
      }, 3000);
    },

    // Vérifie si un volet peut être ouvert
    peutOuvrir(volet) {
      return volet.connectivity !== 'Déconnecté' && volet.position < 100; // Vérifie si le volet est connecté et n'est pas entièrement ouvert
    },

    // Vérifie si un volet peut être fermé
    peutFermer(volet) {
      return volet.connectivity !== 'Déconnecté' && volet.position > 0; // Vérifie si le volet est connecté et n'est pas entièrement fermé
    },

    // Ouvre un volet spécifique
    ouvrirVolet(id) {
      if (!this.estAutorise(['admin', 'Complexe utilisateur', 'Simple utilisateur'], 'Ouvrir volet')) return; // Vérifie l'autorisation
      const volet = this.volets.find(v => v.id === id); // Trouve le volet par son ID
      if (!volet) return;

      if (volet.connectivity === 'Déconnecté') {
        this.afficherErreur(`${volet.name} est déconnecté. Action impossible.`); // Affiche une erreur si le volet est déconnecté
        return;
      }

      volet.position = 100; // Définit la position à 100% (ouvert)
      volet.status = 'ouvert'; // Définit le statut du volet
      this.consommationTotale += 0.15; // Ajoute la consommation d'énergie
      this.logInteraction(`Ouverture de ${volet.name}`); // Log l'ouverture du volet
      this.sauvegarderVolet(volet, `Ouverture de ${volet.name}`); // Sauvegarde l'état du volet
    },

    // Ferme un volet spécifique
    fermerVolet(id) {
      if (!this.estAutorise(['admin', 'Complexe utilisateur', 'Simple utilisateur'], 'Fermer volet')) return; // Vérifie l'autorisation
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
  