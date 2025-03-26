// Application Vue pour gérer l'affichage du profil utilisateur
const profileApp = new Vue({
    el: "#profile",
    data: {
        lastname  : '',
        firstname : '',
        mail      : '',
        type      : ''
    },
    methods: {
        displayProfileInfo(){
            // Méthode pour afficher les données sur ton interface, par exemple :
            console.log(this.lastname, this.firstname, this.type);
            // OU bien tu peux laisser Vue gérer automatiquement l'affichage via HTML.
        }
    }
});

// Fonction qui récupère les infos de profil utilisateur
function getProfileInfo(){
    fetch('../PHP_request/profil.php') // Vérifie bien ce chemin selon ton projet
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur HTTP, status = ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        if(data.error){
            throw new Error(data.error); // Gestion d'erreur serveur (optionnelle mais recommandée)
        }

        // Affectation des données à l'app Vue.js
        profileApp.lastname  = data.last_name;
        profileApp.firstname = data.first_name;
        profileApp.type      = data.type;
        profileApp.mail      = data.mail;

        // Appel explicite à la méthode d'affichage (optionnel)
        profileApp.displayProfileInfo();
    })
    .catch(error => console.error('Erreur lors de la récupération des données :', error));
}

// Lancement automatique dès que le DOM est prêt
document.addEventListener("DOMContentLoaded", getProfileInfo);
