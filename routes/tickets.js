const express = require("express");
const router = express.Router();
const Ticket = require("../models/tickets");
const isEmployeeOrTechnicianOrAdmin = require("../middlewares/isEmployeeOrTechnicianOrAdmin"); // ✅ Middleware existant
const isTechnicianOrAdmin = require("../middlewares/isTechnicianOrAdmin"); // Middleware d'accès

// ✅ Route pour récupérer tous les tickets (Techniciens & Admins uniquement)
router.get("/", isTechnicianOrAdmin, async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("userId", "username")
      .populate("assignedTo", "username");

    res.json({ success: true, tickets });
  } catch (error) {
    console.error("Erreur lors de la récupération des tickets :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ✅ Route pour créer un nouveau ticket et l'enregistrer dans MongoDB Atlas
router.post("/", isEmployeeOrTechnicianOrAdmin, async (req, res) => {
  try {
    const { title, description, category, subcategories, createdBy, userId } =
      req.body;

    // ✅ Vérifier que tous les champs obligatoires sont présents
    if (!title || !description || !category || !createdBy || !userId) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    // ✅ Vérifier si la catégorie est correcte
    if (!["Demande", "Incident"].includes(category)) {
      return res.status(400).json({
        message: "Catégorie invalide. Choisissez 'Demande' ou 'Incident'.",
      });
    }

    // ✅ Générer un numéro unique pour le ticket
    const ticketNumber = Math.floor(100000 + Math.random() * 900000);

    // ✅ Vérifier si subcategories est bien un tableau pour les incidents
    const formattedSubcategories = Array.isArray(subcategories)
      ? subcategories
      : [];

    // ✅ Création du ticket avec le bon format
    const newTicket = new Ticket({
      title,
      description,
      category,
      subcategories: category === "Incident" ? formattedSubcategories : [],
      ticketNumber,
      createdBy,
      userId,
      status: "en cours",
    });

    // ✅ Sauvegarde du ticket dans la base de données
    await newTicket.save();
    res
      .status(201)
      .json({ message: "Ticket créé avec succès", ticket: newTicket });
  } catch (error) {
    console.error("❌ Erreur lors de la création du ticket :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// ✅ Récupérer les 10 derniers tickets de l'utilisateur connecté
router.get("/last", isEmployeeOrTechnicianOrAdmin, async (req, res) => {
  try {
    const userId = req.user._id; // ✅ L'utilisateur connecté via le token

    const tickets = await Ticket.find({ createdBy: userId }) // ✅ Filtre par utilisateur connecté
      .sort({ createdAt: -1 }) // ✅ Trie du plus récent au plus ancien
      .limit(10)
      .populate("createdBy", "username")
      .populate("comments.userId", "username");

    if (!tickets.length) {
      return res.status(404).json({ message: "Aucun ticket trouvé" });
    }

    res.status(200).json(tickets);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des tickets :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// 🔹 Récupérer un ticket spécifique avec les commentaires ET les usernamessssss
router.get("/:id", isTechnicianOrAdmin, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "username")
      .populate("userId", "username")
      .populate("assignedTo", "username")
      .populate("comments.userId", "username");

    if (!ticket) {
      return res.status(404).json({ error: "Ticket non trouvé" });
    }

    res.json(ticket);
  } catch (error) {
    console.error("Erreur récupération ticket:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


module.exports = router;
