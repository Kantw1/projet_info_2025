//sert a afficher les donnees en stockant les constantes php avec vue.js
const profileApp = new Vue({
    el: "#profile-app",
    data: {
        lastname: '',
        firstname: '',
        mail: '',
        type: ''
    }
});


function getProfileInfo(){
    fetch('PHP_request/profile.php')
    .then(response => {
        if (!response.ok) {

            throw new Error('Erreur HTTP, status = ' + response.status);

        }

        return response.json(); // Convertir la réponse en JSON

    })
    .then(data => {
        //stockage des donnees dans des constantes
        profileApp.lastname  =   data.lastname;
        profileApp.firstname =   data.firstname;
        profileApp.type      =   data.type;
        profileApp.mail      =   data.mail;

        //affichage des donnees
        displayProfileInfo(lastname, firstname, type);
    })

    .catch(error => console.error('Erreur lors de la récupération des données :', error));

}

// Appelle la fonction dès que le DOM est prêt
document.addEventListener("DOMContentLoaded", getProfileInfo);

