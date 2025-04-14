// Application Vue pour gérer l'affichage du profil utilisateur
const profileApp = new Vue({
    el: "#profile",
    data: {
        lastname  : '',
        firstname : '',
        mail      : '',
        type          : '',
        modifLastname : '',
        modifFirstname: '',
        modifMail     : '',
        erreurLastname: '',
        erreurFirstname: '',
        erreurMail    : '',
        messageSucces : ''
    },
    methods: {
        displayProfileInfo(){
            // Méthode pour afficher les données sur l'interface
            console.log(this.lastname, this.firstname, this.type);
        },
        enregistrerModifications() {
            // Vérif simple
            if (!this.modifLastname || !this.modifFirstname || !this.modifMail) {
                this.erreurLastname   = !this.modifLastname   ? 'Champ requis' : '';
                this.erreurFirstname  = !this.modifFirstname  ? 'Champ requis' : '';
                this.erreurMail       = !this.modifMail       ? 'Champ requis' : '';
                return;
            }

            // Envoi au serveur
            fetch('../PHP_request/update_profile.php', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    lastname: this.modifLastname,
                    firstname: this.modifFirstname,
                    mail: this.modifMail
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    this.lastname   = this.modifLastname;
                    this.firstname  = this.modifFirstname;
                    this.mail       = this.modifMail;
                    this.messageSucces = "Profil mis à jour avec succès !";
                } else {
                    console.error('Erreur update :', data.error);
                }
            })
            .catch(err => console.error('Erreur réseau :', err));
        }
    }
});

// Fonction qui récupère les infos de profil utilisateur
function getProfileInfo(){

    fetch('../PHP_request/profil.php',{ // Vérifie bien ce chemin selon ton projet
        method: 'GET',
        credentials: 'include' // 🔥 permet à PHP de lire la session
    })
    
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

        // Affectation des données à l'app Vue.js
        profileApp.lastname  = data.last_name;
        profileApp.firstname = data.first_name;
        profileApp.type      = data.type;
        profileApp.mail      = data.mail;

        // Initialisation des champs modifiables
        profileApp.modifLastname  = data.last_name;
        profileApp.modifFirstname = data.first_name;
        profileApp.modifMail      = data.mail;

        // Appel explicite à la méthode d'affichage
        profileApp.displayProfileInfo();
    })

    .catch(error => console.error('Erreur lors de la récupération des données :', error));
    
}

// Lancement automatique dès que le DOM est prêt
document.addEventListener("DOMContentLoaded", getProfileInfo);
