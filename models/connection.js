const mongoose = require("mongoose");

// URI de connexion depuis les variables d'environnement
const connectionString = process.env.CONNECTION_STRING;

// Connexion à la base de données
mongoose
  .connect(connectionString)
  .then(() => console.log(" Database Connected"))
  .catch((error) => console.error("❌ Database Connection Error:", error));

module.exports = mongoose;
