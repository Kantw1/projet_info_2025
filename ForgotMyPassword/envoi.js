document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;

    const response = await fetch("send_reset_link.php", {
        method: "POST",
        headers: {
        "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `email=${encodeURIComponent(email)}`
    });

    if (response.redirected) {
        window.location.href = response.url;
    } else {
        const text = await response.text();
        alert("Erreur : " + text);
    }
    });
});
  