const express = require("express");
const router = express.Router();
const Ticket = require("../models/tickets");
const { isTechnicianOrAdmin } = require("../middlewares/isTechnicianOrAdmin");

// 🔹 Récupérer tous les tickets non attribués d’un service
router.get("/service", isTechnicianOrAdmin, async (req, res) => {
  try {
    const tickets = await Ticket.find({ assignedTo: null });
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

// 🔹 Récupérer les tickets d’un technicien ou administrateur
router.get("/technicien/:id", isTechnicianOrAdmin, async (req, res) => {
  try {
    const tickets = await Ticket.find({ assignedTo: req.params.id });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 Modifier le statut d’un ticket
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
    );
    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;

