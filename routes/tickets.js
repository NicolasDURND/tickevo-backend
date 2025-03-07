const express = require("express");
const router = express.Router();
const Ticket = require("../models/tickets");
const isEmployeeOrTechnicianOrAdmin = require("../middlewares/isEmployeeOrTechnicienOrAdmin"); // ✅ Middleware existant

// ✅ Récupérer les 10 derniers tickets de l'utilisateur connecté
router.get("/last", isEmployeeOrTechnicianOrAdmin, async (req, res) => {
  try {
    const userId = req.user._id; // ✅ L'utilisateur connecté via le token

    const tickets = await Ticket.find({ createdBy: userId }) // ✅ Filtre par utilisateur connecté
      .sort({ createdAt: -1 }) // ✅ Trie du plus récent au plus ancien
      .limit(10)
      .populate("createdBy", "username"); // ✅ Récupère le nom du créateur

    if (!tickets.length) {
      return res.status(404).json({ message: "Aucun ticket trouvé" });
    }

    res.status(200).json(tickets);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des tickets :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

module.exports = router;
