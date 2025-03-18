const User = require("../models/users");

// Middleware pour vérifier si l'utilisateur est Technicien ou Admin
const isTechnicianOrAdmin = async (req, res, next) => {
  // Récupère le token (enlève "Bearer " s'il est présent)
  const token = req.headers.authorization?.replace("Bearer ", "");

  // Si pas de token, renvoie une erreur 401
  if (!token) {
    return res.status(401).json({ error: "Token manquant" });
  }

  try {
    // Cherche l'utilisateur via le token (seulement le roleId)
    const user = await User.findOne({ token }).select("roleId");

    // Si l'utilisateur n'est pas trouvé, renvoie 401
    if (!user) {
      return res.status(401).json({ error: "Utilisateur non autorisé" });
    }

    // Rôles autorisés : Administrateur et Technicien
    const allowedRoleIds = [
      "67d9845f674ea11b061d2323", // Administrateur
      "67d9845f674ea11b061d2324", // Technicien
    ];

    // Vérifie que le roleId est autorisé, sinon renvoie 403
    if (!user.roleId || !allowedRoleIds.includes(user.roleId.toString())) {
      return res.status(403).json({ error: "Accès refusé, rôle non autorisé" });
    }

    // Ajoute l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = isTechnicianOrAdmin;
