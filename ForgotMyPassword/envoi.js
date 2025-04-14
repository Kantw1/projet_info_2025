document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reset-form');
    const feedback = document.getElementById('feedback');
  
    form.addEventListener('submit', function (e) {
      e.preventDefault(); // empêche l'envoi classique
      sendEmail();
    });
  
    function sendEmail() {
      const email = document.getElementById('email').value;
  
      fetch('../PHP_request/send_reset_link.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            feedback.style.color = 'green';
            feedback.textContent = "📧 Lien envoyé ! Vérifiez votre boîte de réception (via MailHog en local).";
          } else {
            feedback.style.color = 'red';
            feedback.textContent = "❌ " + data.message;
          }
        })
        .catch(error => {
          console.error('Erreur réseau :', error);
          feedback.style.color = 'red';
          feedback.textContent = "❌ Erreur réseau. Veuillez réessayer.";
        });
    }
  });
  