document.addEventListener("DOMContentLoaded", function() {
    const tabs = document.querySelectorAll("nav ul li");
    const sections = document.querySelectorAll(".tab-content");
    const logoutButton = document.getElementById("logout");
    const addUserForm = document.getElementById("add-user-form");
    const userList = document.getElementById("user-list");
    const deviceButtons = document.querySelectorAll(".toggle-device");
    const removeUserButtons = document.querySelectorAll(".remove-user");

    // Gestion des onglets
    tabs.forEach(tab => {
        tab.addEventListener("click", function() {
            sections.forEach(section => section.style.display = "none");
            document.getElementById(this.dataset.tab).style.display = "block";
        });
    });

    // Déconnexion
    logoutButton.addEventListener("click", function() {
        alert("Déconnexion réussie");
        window.location.href = "login.html";
    });

    // Ajout d'un utilisateur
    addUserForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const name = document.getElementById("new-user-name").value;
        const id = document.getElementById("new-user-id").value;
        const password = document.getElementById("new-user-password").value;
        const role = document.getElementById("new-user-role").value;
        
        if (name && id && password) {
            const newUser = document.createElement("li");
            newUser.innerHTML = `ID: ${id} - ${name} - ${role} <button class='remove-user'>Supprimer</button>`;
            userList.appendChild(newUser);
            
            newUser.querySelector(".remove-user").addEventListener("click", function() {
                newUser.remove();
            });
        }
    });

    // Suppression d'un utilisateur
    removeUserButtons.forEach(button => {
        button.addEventListener("click", function() {
            this.parentElement.remove();
        });
    });

    // Gestion des objets connectés
    deviceButtons.forEach(button => {
        button.addEventListener("click", function() {
            const device = this.parentElement;
            const status = device.textContent.includes("Actif") ? "Inactif" : "Actif";
            device.innerHTML = `${device.textContent.split(" - ")[0]} - ${status} <button class='toggle-device'>Activer/Désactiver</button>`;
            
            device.querySelector(".toggle-device").addEventListener("click", function() {
                button.click();
            });
        });
    });
});

document.addEventListener("DOMContentLoaded", () => {
    function createTab(title) {
        // Vérifier s'il y a déjà une modale ouverte
        let existingModal = document.querySelector(".modal");
        if (existingModal) {
            existingModal.remove();
            document.querySelector(".modal-overlay").remove();
        }

        // Création de l'overlay (fond sombre)
        const overlay = document.createElement("div");
        overlay.classList.add("modal-overlay");

        // Création de la modale (popup)
        const modal = document.createElement("div");
        modal.classList.add("modal");

        modal.innerHTML = `
            <button class="close-tab">&times;</button>
            <h2>${title}</h2>
            <p>Informations sur : ${title}</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        `;

        // Ajout des éléments dans le body
        document.body.appendChild(overlay);
        document.body.appendChild(modal);

        // Affichage de la modale et de l'overlay
        modal.style.display = "block";
        overlay.style.display = "block";

        // Gestion de la fermeture
        modal.querySelector(".close-tab").addEventListener("click", () => {
            modal.remove();
            overlay.remove();
        });

        overlay.addEventListener("click", () => {
            modal.remove();
            overlay.remove();
        });
    }

    // Gestion des boutons d'objets connectés
    document.querySelectorAll(".device-button").forEach(button => {
        button.addEventListener("click", () => {
            createTab(button.textContent);
        });
    });

    // Gestion des boutons de consommation énergétique
    document.querySelectorAll(".energy-button").forEach(button => {
        button.addEventListener("click", () => {
            createTab(button.textContent);
        });
    });
});
