const User = require("../models/users");

// Middleware pour vérifier si l'utilisateur est Employé, Technicien ou Admin
const isEmployeeOrTechnicianOrAdmin = async (req, res, next) => {
  // Récupère le token (enlève "Bearer " si présent)
  const token = req.headers.authorization?.replace("Bearer ", "");

  // Si pas de token, renvoie une erreur 401
  if (!token) {
    return res.status(401).json({ error: "Token manquant" });
  }

  try {
    // Cherche l'utilisateur par token et récupère uniquement le roleId
    const user = await User.findOne({ token }).select("roleId");

    // Si l'utilisateur n'existe pas, renvoie une erreur 401
    if (!user) {
      return res.status(401).json({ error: "Utilisateur non autorisé" });
    }

    // Rôles autorisés : Admin, Technicien et Employé
    const allowedRoleIds = [
      "67d9845f674ea11b061d2323", // Administrateur
      "67d9845f674ea11b061d2324", // Technicien
      "67d9845f674ea11b061d2325", // Utilisateur (Employé)
    ];

    // Vérifie que le roleId est dans la liste, sinon renvoie 403
    if (!user.roleId || !allowedRoleIds.includes(user.roleId.toString())) {
      return res.status(403).json({ error: "Accès refusé, rôle non autorisé" });
    }

    // Ajoute l'utilisateur à la requête (avec son _id et roleId)
    req.user = { _id: user._id, roleId: user.roleId };

    // Passe au middleware suivant
    next();
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = isEmployeeOrTechnicianOrAdmin;
