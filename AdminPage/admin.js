document.addEventListener("DOMContentLoaded", function() {
    const tabs = document.querySelectorAll("nav ul li");
    const sections = document.querySelectorAll(".tab-content");
    const logoutButton = document.getElementById("logout");
    const addUserForm = document.getElementById("add-user-form");
    const userList = document.getElementById("user-list");
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
})
