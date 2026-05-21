const ngrok = require('@ngrok/ngrok');
require('dotenv').config();

const port = process.env.PORT || 5000;
const authtoken = process.env.NGROK_AUTHTOKEN || process.argv[2];

if (!authtoken) {
  console.error('\x1b[31m❌ Erreur: Aucun authtoken ngrok trouvé !\x1b[0m');
  console.log('\x1b[33m👉 Comment obtenir votre authtoken :\x1b[0m');
  console.log('   1. Inscrivez-vous gratuitement sur https://dashboard.ngrok.com');
  console.log('   2. Copiez votre "Your Authtoken" depuis le tableau de bord.');
  console.log('   3. Lancez le script en passant le token en argument :');
  console.log('      node ngrok.js VOTRE_TOKEN_ICI');
  console.log('      ou ajoutez NGROK_AUTHTOKEN=VOTRE_TOKEN dans votre fichier backend/.env');
  process.exit(1);
}

async function startTunnel() {
  try {
    console.log(`⏳ Connexion à ngrok pour exposer le port ${port}...`);
    const listener = await ngrok.forward({
      addr: port,
      authtoken: authtoken
    });
    console.log('\n\x1b[32m==================================================\x1b[0m');
    console.log(`✅ Tunnel ngrok démarré avec succès !`);
    console.log(`🔗 URL publique de votre Backend : \x1b[36m${listener.url()}\x1b[0m`);
    console.log(`👉 Utilisez cette URL comme VITE_API_URL dans Netlify !`);
    console.log('\x1b[32m==================================================\x1b[0m\n');
    console.log('Appuyez sur Ctrl+C pour arrêter le tunnel.');
    
    // Garder le processus Node.js actif
    setInterval(() => {}, 60000);
  } catch (err) {
    console.error('❌ Erreur lors de la création du tunnel ngrok :', err.message);
    process.exit(1);
  }
}

startTunnel();
