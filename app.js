require("dotenv").config(); // Charge les variables d'environnement depuis .env
require("./models/connection.js"); // Initialise la connexion à MongoDB

const express = require("express"); // Importe Express
const path = require("path"); // Importe le module path pour gérer les chemins
const cookieParser = require("cookie-parser"); // Importe cookie-parser pour gérer les cookies
const logger = require("morgan"); // Importe morgan pour logger les requêtes HTTP

const indexRouter = require("./routes/index"); // Importe le routeur pour la racine "/"
var usersRouter = require("./routes/users"); // Importe le routeur pour les utilisateurs
var ticketsRoutes = require("./routes/tickets"); // Importe le routeur pour les tickets
var ticketsTechnicienRoutes = require("./routes/ticketsTechnicien"); // Importe le routeur pour les tickets techniciens

const app = express(); // Crée une instance d'Express

const cors = require("cors"); // Importe cors pour gérer les requêtes cross-origin

app.use(cors()); // Active CORS pour autoriser les requêtes depuis d'autres domaines
app.use(logger("dev")); // Active le logger en mode "dev"
app.use(express.json()); // Parse le JSON dans les requêtes entrantes
app.use(express.urlencoded({ extended: false })); // Parse les données URL-encodées
app.use(cookieParser()); // Active le parsing des cookies
app.use(express.static(path.join(__dirname, "public"))); // indique à l'application que tous les fichiers contenus dans le dossier "public" sont accessibles directement via HTTP

app.use("/tickets", ticketsRoutes); // Utilise le routeur pour "/tickets"
app.use("/ticketsTechnicien", ticketsTechnicienRoutes); // Utilise le routeur pour "/ticketsTechnicien"
app.use("/", indexRouter); // Utilise le routeur pour la racine "/"
app.use("/users", usersRouter); // Utilise le routeur pour "/users"

module.exports = app; // Exporte l'application pour être utilisée ailleurs (ex: dans le serveur)
