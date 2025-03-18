const User = require("../models/users"); // Importe le modèle "User" depuis le dossier "models"

// Middleware pour authentifier via token et vérifier le rôle
const isAdmin = async (req, res, next) => {
  // Récupère le token dans l'en-tête Authorization et retire le préfixe "Bearer " s'il existe
  const token = req.headers.authorization?.replace("Bearer ", "");

  // Si aucun token présent, renvoie une réponse 401 avec le message "Token manquant"
  if (!token) {
    return res.status(401).json({ error: "Token manquant" });
  }

  try {
    // Recherche l'utilisateur dans la base en utilisant le token
    // sélectionne que le champ "roleId" (l'identifiant du rôle)
    const user = await User.findOne({ token }).select("roleId");

    // Si utilisateur pas trouvé, renvoie une réponse 401 avec le message "Utilisateur non autorisé"
    if (!user) {
      return res.status(401).json({ error: "Utilisateur non autorisé" });
    }

    // Définition des rôles autorisés (ici, uniquement l'administrateur)
    const allowedRoleIds = [
      "67d9845f674ea11b061d2323", // Administrateur
    ];

    // Vérifie que l'utilisateur a un "roleId" et que ce "roleId" fait partie des rôles autorisés
    if (!user.roleId || !allowedRoleIds.includes(user.roleId.toString())) {
      // Si le rôle n'est pas autorisé, renvoie une réponse 403 avec le message "Accès refusé, rôle non autorisé"
      return res.status(403).json({ error: "Accès refusé, rôle non autorisé" });
    }

    // Injecte l'objet utilisateur dans la requête pour le rendre accessible aux middlewares ou routes suivants
    req.user = user;
    // Passe au middleware suivant dans la chaîne
    next();
  } catch (error) {
    // Si erreur lors de la vérification du token, affiche l'erreur dans la console
    console.error("Erreur lors de la vérification du token:", error);
    // Renvoie une réponse 500 indiquant une erreur serveur
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Exporte le middleware "isAdmin" afin d'être utilisé dans d'autres parties de l'application
module.exports = isAdmin;
