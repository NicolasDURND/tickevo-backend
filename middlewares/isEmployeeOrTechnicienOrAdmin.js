const User = require("../models/users");

// Middleware pour authentifier via token et vérifier le rôle
const isEmployeeOrTechnicianOrAdmin = async (req, res, next) => {
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
      "67c5cfc16f453c87fb23c607", // Administrateur
      "67c5cfc16f453c87fb23c609", // Technicien
      "67c5cfc16f453c87fb23c60b", // Utilisateur (Employé)
    ];

    // Vérification de l'appartenance à un rôle autorisé
    if (!user.roleId || !allowedRoleIds.includes(user.roleId.toString())) {
      return res.status(403).json({ error: "Accès refusé, rôle non autorisé" });
    }

    req.user = { _id: user._id, roleId: user.roleId }; // ✅ Ajouté pour s'assurer que req.user._id est bien défini

    next(); // Passe au middleware suivant
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = isEmployeeOrTechnicianOrAdmin;
