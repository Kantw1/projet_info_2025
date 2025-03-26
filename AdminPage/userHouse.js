// Application Vue pour gérer l'affichage du profil utilisateur
const usersApp = new Vue({
    el: "#users",
    data: {
        users: [] // tableau d'objets {lastname, firstname, type}
    },
    methods: {
        displayUsersInfo(){
            // Méthode pour afficher les données sur l'interface
            console.log(this.lastname, this.firstname, this.type);
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
