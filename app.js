const express = require("express");
const dotenv = require("dotenv");

const app = express();
const PORT = 3000;
const DISCOGS_CONSUMER_KEY = process.env.DISCOGS_CONSUMER_KEY;
const DISCOGS_CONSUMER_SECRET = process.env.DISCOGS_CONSUMER_SECRET;

var Discogs = require("disconnect").Client;

var dis = new Discogs({
  consumerKey: DISCOGS_CONSUMER_KEY,
  consumerSecret: DISCOGS_CONSUMER_SECRET,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    // Récupérer la requête de l'utilisateur
    const userMessage = req.body.user_message;

    // Effectuer une recherche Discogs avec la requête utilisateur
    dis
      .database()
      .search(userMessage, { type: "release" })
      .then(function (data) {
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

app.listen(PORT, () => {
  console.log(`Le serveur est en cours d'exécution sur le port ${PORT}`);
});
