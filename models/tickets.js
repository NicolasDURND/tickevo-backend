const mongoose = require("mongoose");

// Schéma pour les sous-catégories
const subcategorySchema = mongoose.Schema({
  subCategoryLevel: { type: Number, required: true }, // Niveau de la sous-catégorie (ex: 1, 2, 3)
  subCategoryName: { type: String, required: true }, // Nom de la sous-catégorie
});

// Schéma pour les commentaires des tickets
const commentSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true, // L'utilisateur qui a posté le commentaire est obligatoire
  },
  message: { type: String, required: true }, // Contenu du commentaire
  timestamp: { type: Date, default: Date.now }, // Date et heure du commentaire
});

// Schéma pour les tickets
const ticketSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true, // Identifiant de l'utilisateur lié au ticket
    },
    ticketNumber: { type: Number, required: true, unique: true }, // Numéro unique du ticket
    title: { type: String, required: true }, // Titre du ticket
    description: { type: String, required: true }, // Description détaillée du problème ou de la demande
    status: {
      type: String,
      enum: ["en cours", "en attente", "clôturé"], // Statut du ticket avec valeurs prédéfinies
      default: "en cours", // Statut par défaut à la création du ticket
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true, // Identifiant de l'utilisateur qui a créé le ticket
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    }, // Identifiant de l'utilisateur assigné au ticket (facultatif)
    categories: {
      type: String,
      enum: ["Demande", "Incident"],
      required: true, // Catégorie obligatoire (soit une demande, soit un incident)
    },
    subcategories: [subcategorySchema], // Tableau contenant les sous-catégories du ticket
    comments: [commentSchema], // Tableau contenant les commentaires associés au ticket
  },
  { timestamps: true } // Ajoute automatiquement createdAt et updatedAt
);

// Création du modèle Ticket basé sur le schéma
const Ticket = mongoose.model("tickets", ticketSchema);

// Exportation du modèle pour être utilisé ailleurs dans l'application
module.exports = Ticket;
