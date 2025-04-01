(function () {
    // 1. Nettoyage (optionnel si nécessaire)
    const container = document.getElementById("dynamic-tabs");
    container.innerHTML = ""; // Vider les fiches précédentes

    // 2. Si le HTML est déjà dans la page, on le déplace simplement
    const existing = document.getElementById("thermostat-component");
    container.appendChild(existing);

    // 3. Lancer Vue.js sur la div déjà écrite dans le HTML
    new Vue({
        el: '#thermostat-component',
        data: {
            thermostat: {
                name: 'Thermostat',
                temp: 22.3,
                target: 23.0,
                humidity: 54,
                energy: 66
            }
        }
    });
})();
