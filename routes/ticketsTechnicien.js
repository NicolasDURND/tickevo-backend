const express = require("express"); // Importe Express
const router = express.Router(); // Crée un routeur Express
const Ticket = require("../models/tickets"); // Importe le modèle Ticket
const isTechnicianOrAdmin = require("../middlewares/isTechnicianOrAdmin"); // Importe le middleware pour techniciens/admin

// Récupère tous les tickets non attribués (assignedTo = null)
router.get("/service", isTechnicianOrAdmin, async (req, res) => { // Route GET "/service" protégée
  try {
    // Cherche les tickets sans technicien assigné
    const tickets = await Ticket.find({ assignedTo: null }) // Recherche des tickets sans valeur pour "assignedTo"
      .populate("userId", "username") // Ajoute le champ "username" de l'auteur du ticket
      .populate("assignedTo", "username"); // Tente d'ajouter le "username" du technicien (aucun ici)
      
    res.json(tickets); // Renvoie les tickets trouvés au format JSON
  } catch (error) { // En cas d'erreur
    res.status(500).json({ error: "Erreur serveur" }); // Renvoie une erreur serveur 500
  }
});

// Attribue un ticket à un technicien ou administrateur
router.patch("/:id/assign", isTechnicianOrAdmin, async (req, res) => { // Route PATCH pour attribuer un ticket
  try {
    const { technicianId } = req.body; // Récupère l'ID du technicien depuis le corps de la requête
    // Met à jour le ticket avec l'ID du technicien
    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id, // Utilise l'ID du ticket depuis l'URL
      { assignedTo: technicianId }, // Définit le technicien assigné
      { new: true } // Retourne le ticket mis à jour
    );
    res.json(updatedTicket); // Renvoie le ticket mis à jour
  } catch (error) { // En cas d'erreur
    res.status(500).json({ error: "Erreur serveur" }); // Renvoie une erreur serveur 500
  }
});

// Réattribue un ticket à un autre technicien
router.patch("/:id/reassign", isTechnicianOrAdmin, async (req, res) => { // Route PATCH pour réattribuer un ticket
  try {
    const { newTechnicianId } = req.body; // Récupère le nouvel ID du technicien depuis le corps de la requête
    // Met à jour le ticket avec le nouvel ID
    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id, // Utilise l'ID du ticket depuis l'URL
      { assignedTo: newTechnicianId }, // Définit le nouveau technicien assigné
      { new: true } // Retourne le ticket mis à jour
    );
    res.json(updatedTicket); // Renvoie le ticket mis à jour
  } catch (error) { // En cas d'erreur
    res.status(500).json({ error: "Erreur serveur" }); // Renvoie une erreur serveur 500
  }
});

// Récupère les tickets assignés à un technicien ou admin spécifique
router.get("/technicien/:id", isTechnicianOrAdmin, async (req, res) => { // Route GET pour les tickets d'un technicien spécifique
  try {
    // Filtre les tickets par technicien assigné (ID dans l'URL)
    const tickets = await Ticket.find({ assignedTo: req.params.id });
    res.json(tickets); // Renvoie les tickets filtrés
  } catch (error) { // En cas d'erreur
    res.status(500).json({ error: "Erreur serveur" }); // Renvoie une erreur serveur 500
  }
});

// Récupère les tickets assignés/clôturés pour un technicien donné
router.get("/assigned/:technicianId", isTechnicianOrAdmin, async (req, res) => { // Route GET pour récupérer les tickets d'un technicien
  try {
    console.log(`Recherche des tickets assignés à: ${req.params.technicianId}`); // Affiche l'ID du technicien dans la console
    
    // Cherche les tickets du technicien et les trie du plus récent au plus ancien
    const tickets = await Ticket.find({ assignedTo: req.params.technicianId })
      .populate("userId", "username") // Ajoute le username de l'auteur du ticket
      .populate("assignedTo", "username") // Ajoute le username du technicien assigné
      .sort({ createdAt: -1 }); // Trie par date de création décroissante
    
    console.log(`Tickets trouvés: ${tickets.length}`); // Affiche le nombre de tickets trouvés
    res.json({ tickets }); // Renvoie les tickets dans un objet JSON
  } catch (error) { // En cas d'erreur
    console.error("Erreur lors de la récupération des tickets assignés:", error); // Affiche l'erreur dans la console
    res.status(500).json({ error: "Erreur serveur" }); // Renvoie une erreur serveur 500
  }
});

// Modifie le statut d'un ticket
router.patch("/:id/status", isTechnicianOrAdmin, async (req, res) => { // Route PATCH pour modifier le statut d'un ticket
  try {
    const { status } = req.body; // Récupère le nouveau statut depuis le corps de la requête
    // Met à jour le ticket en changeant son statut
    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id, // Utilise l'ID du ticket depuis l'URL
      { status }, // Met à jour le champ "status" avec la nouvelle valeur
      { new: true } // Retourne le ticket mis à jour
    );
    res.json(updatedTicket); // Renvoie le ticket mis à jour
  } catch (error) { // En cas d'erreur
    res.status(500).json({ error: "Erreur serveur" }); // Renvoie une erreur serveur 500
  }
});

// Ajoute un commentaire à un ticket
router.post("/:id/comment", isTechnicianOrAdmin, async (req, res) => { // Route POST pour ajouter un commentaire
  try {
    const { userId, message } = req.body; // Récupère l'ID de l'utilisateur et le message du commentaire
    // Ajoute le commentaire au ticket avec la date actuelle
    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id, // Utilise l'ID du ticket depuis l'URL
      { $push: { comments: { userId, message, timestamp: new Date() } } }, // Ajoute le commentaire dans le tableau "comments"
      { new: true } // Retourne le ticket mis à jour
    ).populate("comments.userId", "username"); // Ajoute le username pour chaque commentaire
    res.json(updatedTicket); // Renvoie le ticket mis à jour avec le nouveau commentaire
  } catch (error) { // En cas d'erreur
    res.status(500).json({ error: "Erreur serveur" }); // Renvoie une erreur serveur 500
  }
});

module.exports = router; // Exporte le routeur pour l'utiliser dans l'application