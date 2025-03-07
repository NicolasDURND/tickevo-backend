const mongoose = require("mongoose");

// Schéma pour les sous-catégories des tickets
const subcategorySchema = new mongoose.Schema({
  subCategoryLevel: { type: Number, required: true },
  subCategoryName: { type: String, required: true },
});

// Schéma pour les commentaires des tickets
const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Schéma principal des tickets
const ticketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    ticketNumber: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["en cours", "en attente", "clôturé"],
      default: "en cours",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    category: { type: String, enum: ["Demande", "Incident"], required: true },
    subcategories: [subcategorySchema],
    comments: [commentSchema],
  },
  { timestamps: true }
);

// Création du modèle "Tickets" basé sur le schéma
const Ticket = mongoose.model("tickets", ticketSchema);

module.exports = Ticket;
