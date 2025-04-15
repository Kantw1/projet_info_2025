document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reset-password-form');
    const feedback = document.getElementById('feedback');
  
    // Récupération du token depuis l'URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
  
    if (!token) {
      feedback.style.color = 'red';
      feedback.textContent = "❌ Lien invalide ou expiré.";
      form.style.display = "none";
      return;
    }
  
    form.addEventListener('submit', (e) => {
      e.preventDefault();
  
      const newPassword = document.getElementById('new-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
  
      if (newPassword !== confirmPassword) {
        feedback.style.color = 'red';
        feedback.textContent = "❌ Les mots de passe ne correspondent pas.";
        return;
      }
  
      fetch('../PHP_request/confirm_reset_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          newPassword: newPassword
        })
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            feedback.style.color = 'green';
            feedback.textContent = "✅ Mot de passe réinitialisé avec succès.";
            form.reset();
          } else {
            feedback.style.color = 'red';
            feedback.textContent = "❌ " + data.message;
          }
        })
        .catch(err => {
          feedback.style.color = 'red';
          feedback.textContent = "❌ Erreur réseau. Veuillez réessayer.";
          console.error(err);
        });
    });
  });
  