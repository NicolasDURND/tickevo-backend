// const express = require("express");
// const router = express.Router();
// const Ticket = require("../models/Ticket");
// const User = require("../models/users");

// // Route pour récupérer les 10 derniers tickets en cours avec les infos des utilisateurs
// router.get("/last", async (req, res) => {
//   try {
//     const tickets = await Ticket.find({ status: "en cours" })
//       .sort({ createdAt: -1 }) // Trier du plus récent au plus ancien
//       .limit(10)
//       .populate("assignedTo", "username"); // Récupère uniquement le username de l'utilisateur affecté

//     res.status(200).json(tickets);
//   } catch (error) {
//     console.error("Erreur lors de la récupération des tickets :", error);
//     res.status(500).json({ message: "Erreur serveur", error });
//   }
// });

// // Route pour créer un nouveau ticket
// router.post("/", async (req, res) => {
//   try {
//     const { title, description, category } = req.body;

//     if (!title || !description || !category) {
//       return res.status(400).json({ message: "Tous les champs sont requis" });
//     }

//     const newTicket = new Ticket({
//       title,
//       description,
//       category,
//       status: "ouvert", // Un ticket commence avec le statut "ouvert"
//       createdAt: new Date(),
//     });

//     await newTicket.save();
//     res
//       .status(201)
//       .json({ message: "Ticket créé avec succès", ticket: newTicket });
//   } catch (error) {
//     console.error("Erreur lors de la création du ticket :", error);
//     res.status(500).json({ message: "Erreur serveur", error });
//   }
// });

// module.exports = router;
