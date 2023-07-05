require("dotenv").config();
if (!process.env.DISCOGS_CONSUMER_KEY || !process.env.DISCOGS_CONSUMER_SECRET) {
  console.error(
    "Erreur : Les variables d'environnement DISCOGS_CONSUMER_KEY et DISCOGS_CONSUMER_SECRET ne sont pas définies. Veuillez vous assurer qu'elles sont définies dans votre fichier .env."
  );
  process.exit(1);
}
const express = require("express");
const app = express();
const cors = require("cors");
const Discogs = require("disconnect").Client;

// Initialiser le client Discogs avec la clé consommateur et le secret
const dis = new Discogs("MonAgentUtilisateur/1.0", {
  consumerKey: process.env.DISCOGS_CONSUMER_KEY,
  consumerSecret: process.env.DISCOGS_CONSUMER_SECRET,
}).database();

console.log(`Clé Consommateur: ${process.env.DISCOGS_CONSUMER_KEY}`);
console.log(`Secret Consommateur: ${process.env.DISCOGS_CONSUMER_SECRET}`);

// Middleware pour analyser les requêtes JSON
app.use(express.json());

// Activer CORS
app.use(cors());

app.post("/chat", async (req, res) => {
  try {
    // Récupérer la requête de l'utilisateur
    const userMessage = req.body.user_message;
    console.log("Message de l'utilisateur :", userMessage);

    // Effectuer une recherche Discogs avec la requête utilisateur
    dis
      .search(userMessage, { type: "release" })
      .then(function (data) {
        console.log("Réponse de l'API Discogs :", data);

        // Traiter la réponse de l'API Discogs
        if (data.results && data.results.length > 0) {
          // Extraire les informations pertinentes
          const results = data.results;
          // Formater les informations dans une réponse à l'utilisateur
          let formattedResults = results
            .slice(0, 5)
            .map((result, index) => {
              return `${index + 1}. ${result.title} par ${result.artist}`;
            })
            .join("\n");

          // Retourner la réponse générée par ChatGPT
          res.json({
            message: `Voici les résultats de votre recherche :\n${formattedResults}`,
          });
        } else {
          res.json({
            message:
              "Je suis désolé, je n'ai pas trouvé de résultats pour votre recherche.",
          });
        }
      })
      .catch(function (error) {
        console.error("Une erreur s'est produite :", error);
        res.status(500).json({
          message:
            "Une erreur s'est produite lors du traitement de votre requête.",
        });
      });
  } catch (error) {
    console.error("Une erreur s'est produite :", error);
    res.status(500).json({
      message: "Une erreur s'est produite lors du traitement de votre requête.",
    });
  }
});

// Définir le port
const port = process.env.PORT || 3000;

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
