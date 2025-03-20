// Vérification et affichage des erreurs dans l'URL
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");

    if (error) {
        const errorMessage = document.getElementById("errorMessage");
        errorMessage.textContent = error;
        errorMessage.style.display = "block";

        // Effacer le message après 5 secondes
        setTimeout(() => {
            errorMessage.style.display = "none";
        }, 5000);
    }
};