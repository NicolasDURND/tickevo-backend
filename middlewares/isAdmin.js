const User = require("../models/users");

// Middleware pour authentifier via token et vérifier le rôle
const isAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Token manquant" });
  }

  try {
    // Recherche l'utilisateur par son token et récupère uniquement l'id du rôle
    const user = await User.findOne({ token }).select("roleId");

    if (!user) {
      return res.status(401).json({ error: "Utilisateur non autorisé" });
    }

    // Définition des rôles autorisés avec leurs ID
    const allowedRoleIds = [
      "67ce260d68a51411a303d0c5", // Administrateur
    ];

    // Vérification de l'appartenance à un rôle autorisé
    if (!user.roleId || !allowedRoleIds.includes(user.roleId.toString())) {
      return res.status(403).json({ error: "Accès refusé, rôle non autorisé" });
    }

    req.user = user; // Injecte l'utilisateur dans la requête
    next(); // Passe au middleware suivant
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = isAdmin;
