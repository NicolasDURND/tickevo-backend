const express = require("express");
const router = express.Router();
const Ticket = require("../models/tickets");
const isEmployeeOrTechnicianOrAdmin = require("../middlewares/isEmployeeOrTechnicianOrAdmin"); // Droits employés, techniciens ou admin
const isTechnicianOrAdmin = require("../middlewares/isTechnicianOrAdmin"); // Droits techniciens ou admin

// GET "/" - Récupère tous les tickets (techniciens & admin)
router.get("/", isTechnicianOrAdmin, async (req, res) => {
  try {
    // Récupère tous les tickets et ajoute les usernames
    const tickets = await Ticket.find()
      .populate("userId", "username") // Ajoute le username de l'auteur
      .populate("assignedTo", "username"); // Ajoute le username du technicien assigné

    res.json({ success: true, tickets }); // Renvoie les tickets avec succès
  } catch (error) {
    console.error("Erreur lors de la récupération des tickets :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// POST "/" - Crée un nouveau ticket
router.post("/", isEmployeeOrTechnicianOrAdmin, async (req, res) => {
  try {
    // Extrait les infos du corps de la requête
    const { title, description, category, subcategories, createdBy, userId } = req.body;

    // Vérifie que tous les champs essentiels sont présents
    if (!title || !description || !category || !createdBy || !userId) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    // Vérifie que la catégorie est "Demande" ou "Incident"
    if (!["Demande", "Incident"].includes(category)) {
      return res.status(400).json({ message: "Catégorie invalide. Choisissez 'Demande' ou 'Incident'." });
    }

    // Génère un numéro unique pour le ticket
    const ticketNumber = Math.floor(100000 + Math.random() * 900000);

    // Assure que subcategories est un tableau, sinon vide
    const formattedSubcategories = Array.isArray(subcategories) ? subcategories : [];

    // Crée le ticket avec les infos fournies
    const newTicket = new Ticket({
      title,
      description,
      category,
      subcategories: category === "Incident" ? formattedSubcategories : [],
      ticketNumber,
      createdBy,
      userId,
      status: "en cours", // Statut par défaut
    });

    // Sauvegarde le ticket en base
    await newTicket.save();
    res.status(201).json({ message: "Ticket créé avec succès", ticket: newTicket });
  } catch (error) {
    console.error("❌ Erreur lors de la création du ticket :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// GET "/last" - Récupère les 10 derniers tickets de l'utilisateur connecté
router.get("/last", isEmployeeOrTechnicianOrAdmin, async (req, res) => {
  try {
    const userId = req.user._id; // ID de l'utilisateur connecté via le token

    // Récupère et trie les tickets du plus récent au plus ancien, limite à 10
    const tickets = await Ticket.find({ createdBy: userId })
      .sort({ createdAt: -1 })
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

// GET "/:id" - Récupère un ticket spécifique avec ses commentaires et usernames
router.get("/:id", isEmployeeOrTechnicianOrAdmin, async (req, res) => {
  try {
    // Cherche le ticket par son ID et ajoute les usernames liés
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
