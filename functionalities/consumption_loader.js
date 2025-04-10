// fichier : functionalities/consumption_loader.js

const consumptionScripts = ['consumption.js']; // plus tard tu peux rajouter : 'chartEau.js', etc.

consumptionScripts.forEach(scriptName => {
  const script = document.createElement('script');
  script.src = `functionalities/consumption/${scriptName}`;
  script.onload = () => console.log(`${scriptName} chargé`);
  script.onerror = () => console.warn(`Erreur chargement ${scriptName}`);
  document.head.appendChild(script);
});
