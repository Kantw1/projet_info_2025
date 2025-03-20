        function validateForm() {
            let password = document.getElementById("password").value;
            let confirm_password = document.getElementById("confirm_password").value;
            let errorMessage = document.getElementById("errorMessage");

            if (password !== confirm_password) {
                errorMessage.textContent = "Les mots de passe ne correspondent pas.";
                errorMessage.style.display = "block";
                return false;
            }
            return true;
        }

        // Récupération du message d'erreur depuis l'URL
        window.onload = function() {
            const urlParams = new URLSearchParams(window.location.search);
            const error = urlParams.get("error");

            if (error) {
                const errorMessage = document.getElementById("errorMessage");
                errorMessage.textContent = error;
                errorMessage.style.display = "block";

                // Effacer l'erreur après 5 secondes
                setTimeout(() => {
                    errorMessage.style.display = "none";
                }, 5000);
            }
        };