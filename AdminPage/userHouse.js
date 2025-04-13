// Application Vue pour gérer l'affichage du profil utilisateur
const usersApp = new Vue({

    el  : "#show_users",

    data: {
        erreurAutorisation: '',
        userType: '',
        users: [] // tableau d'objets {lastname, firstname, type}
    },

    mounted(){
        this.chargerTypeUtilisateur();
    },
    // Declaration des methodes utiliser dans l'application
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

        displayUsersInfo() {

            // Méthode pour afficher les données sur l'interface
            console.log(this.users);

        },

        getNextType(currentType) {
            const order = ['Simple utilisateur', 'Complexe utilisateur', 'admin'];
            const currentIndex = order.indexOf(currentType);
            return order[currentIndex + 1] || ''; // Si admin, on renvoie vide
        },
        toggleAutorisation(index) {
            if (!this.estAutorise(['admin'], 'Autoriser au passage admin')) return;
            const user = this.users[index];
            const nouvelleValeur = user.autorisationAdmin === 'OUI' ? 'NON' : 'OUI';
        
            // Mettre à jour côté client
            this.users[index].autorisationAdmin = nouvelleValeur;
        
            const formData = new FormData();
            formData.append("nom", user.lastname);
            formData.append("prenom", user.firstname);
            formData.append("autorisationAdmin", nouvelleValeur);
        
            fetch("../PHP_request/updateAutorisation.php", {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    alert("Erreur lors de la mise à jour : " + (data.message || ""));
                } else {
                    getUsersData(); // ✅ Recharge les données après succès
                }
            })
            .catch(err => {
                console.error("Erreur réseau :", err);
                alert("Erreur réseau ou serveur");
            });
        },        
        
        
        
        // Méthode pour supprimer un utilisateur
        removeUser(index) {
            if (!this.estAutorise(['admin'], 'Supprimer un utilisateur')) return;

            const userToDelete = this.users[index];
        
            if (!confirm(`Supprimer ${userToDelete.firstname} ${userToDelete.lastname} ?`)) return;
            
            // Création d'un objet FormData pour envoyer les données à PHP pour la suppression
            const formData = new FormData();

            formData.append("nom", userToDelete.lastname);
            formData.append("prenom", userToDelete.firstname);
            formData.append("type", userToDelete.type);


            fetch('../Inscription_connection/deleteUser.php', {
                method: 'POST',
                body: formData
            })

            .then(response => response.json())

            .then(data => {

                if (data.success) {
                    // Supprimer visuellement l'utilisateur
                    this.users.splice(index, 1);
                }

                else {
                    alert(data.message || "Erreur lors de la suppression");
                }
            })

            .catch(error => {
                console.error('Erreur réseau ou serveur :', error);
                alert("Erreur réseau ou serveur");
            });

        },
        goToAddUser() {
            if (!this.estAutorise(['admin'], 'Ajouter un utilisateur')) return;
            window.location.href = "../Inscription_connection/ajouter_utilisateur.html";
        }
    }
});


// Fonction qui récupère
function getUsersData(){

    fetch('../PHP_request/users_house.php') // Vérifie bien ce chemin selon ton projet

    .then(response => {

        if (!response.ok) {

            throw new Error('Erreur HTTP, status = ' + response.status);

        }

        return response.json();
    })

    .then(data => {

        if(data.error){

            throw new Error(data.error); // Gestion d'erreur serveur

        }

        // Affectation des données à l'app Vue.js, ici on stocke un tableau d'utilisateurs car on récupère plusieurs utilisateurs aà la fois
        usersApp.users = data;
        usersApp.displayUsersInfo();
    })

    .catch(error => console.error('Erreur lors de la récupération des données :', error));
}

// Lancement automatique dès que le DOM est prêt
document.addEventListener("DOMContentLoaded", getUsersData);


