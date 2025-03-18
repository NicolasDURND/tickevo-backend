const mongoose = require("mongoose");

// Schéma de sous-catégorie : niveau et nom de la sous-catégorie
const subcategorySchema = new mongoose.Schema({
  subCategoryLevel: { type: Number, required: true },
  subCategoryName: { type: String, required: true },
});

// Schéma de commentaire : utilisateur, message et date
const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Schéma principal du ticket
const ticketSchema = new mongoose.Schema(
  {
    // Utilisateur qui crée le ticket
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    // Numéro unique du ticket
    ticketNumber: { type: Number, required: true, unique: true },
    // Titre et description du ticket
    title: { type: String, required: true },
    description: { type: String, required: true },
    // Statut du ticket
    status: { type: String, enum: ["en cours", "en attente", "clôturé"], default: "en cours" },
    // Créateur et technicien assigné
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    // Catégorie du ticket
    category: { type: String, enum: ["Demande", "Incident"], required: true },
    // Sous-catégories et commentaires
    subcategories: [subcategorySchema],
    comments: [commentSchema],
  },
  { timestamps: true } // Ajoute createdAt et updatedAt
);

// Création du modèle "Ticket"
const Ticket = mongoose.model("tickets", ticketSchema);

module.exports = Ticket;
