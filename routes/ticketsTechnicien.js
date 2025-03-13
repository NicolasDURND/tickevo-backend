const express = require("express");
const router = express.Router();
const Ticket = require("../models/tickets");
const isTechnicianOrAdmin = require("../middlewares/isTechnicianOrAdmin");

// 🔹 Récupérer tous les tickets non attribués d'un service
router.get("/service", isTechnicianOrAdmin, async (req, res) => {
  try {
    const tickets = await Ticket.find({ assignedTo: null })
      .populate('userId', 'username')
      .populate('assignedTo', 'username');
      
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 Attribuer un ticket à un technicien (ou administrateur)
router.patch("/:id/assign", isTechnicianOrAdmin, async (req, res) => {
  try {
    const { technicianId } = req.body;
    const updatedTicket = await Ticket.findByIdAndUpdate(req.params.id, { assignedTo: technicianId }, { new: true });
    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 Réattribuer un ticket
router.patch("/:id/reassign", isTechnicianOrAdmin, async (req, res) => {
  try {
    const { newTechnicianId } = req.body;
    const updatedTicket = await Ticket.findByIdAndUpdate(req.params.id, { assignedTo: newTechnicianId }, { new: true });
    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 Récupérer les tickets d'un technicien ou administrateur
router.get("/technicien/:id", isTechnicianOrAdmin, async (req, res) => {
  try {
    const tickets = await Ticket.find({ assignedTo: req.params.id });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 Récupérer tous les tickets assignés ou clôturés par un technicien/administrateur
router.get("/assigned/:technicianId", isTechnicianOrAdmin, async (req, res) => {
  try {
    console.log(`Recherche des tickets assignés à: ${req.params.technicianId}`);
    
    // Récupère uniquement les tickets qui sont assignés au technicien connecté
    // Assurons-nous que c'est bien ce technicien qui est assigné au ticket
    const tickets = await Ticket.find({ 
      assignedTo: req.params.technicianId // Ce technicien doit être celui qui est assigné
    })
    .populate('userId', 'username')
    .populate('assignedTo', 'username')
    .sort({ createdAt: -1 }); // Tri par date de création, du plus récent au plus ancien
    
    console.log(`Tickets trouvés: ${tickets.length}`);
    res.json({ tickets });
  } catch (error) {
    console.error("Erreur lors de la récupération des tickets assignés:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 Modifier le statut d'un ticket
router.patch("/:id/status", isTechnicianOrAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const updatedTicket = await Ticket.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 Ajouter un commentaire à un ticket
router.post("/:id/comment", isTechnicianOrAdmin, async (req, res) => {
  try {
    const { userId, message } = req.body;
    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { userId, message, timestamp: new Date() } } },
      { new: true }
    ).populate("comments.userId", "username");
    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
