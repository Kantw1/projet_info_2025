// Application Vue pour gérer l'affichage du profil utilisateur
const usersApp = new Vue({

    el  : "#show_users",

    data: {
        users: [] // tableau d'objets {lastname, firstname, type}
    },

    // Declaration des methodes utiliser dans l'application
    methods: {

        displayUsersInfo() {

            // Méthode pour afficher les données sur l'interface
            console.log(this.users);

        },
        
        // Méthode pour supprimer un utilisateur
        removeUser(index) {

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
