const mongoose = require("mongoose");

// Définition du schéma pour les services
const serviceSchema = new mongoose.Schema({
  ServiceName: {
    type: String,
    required: true, // Le nom du service est obligatoire
    trim: true, // Supprime les espaces inutiles
    minlength: 3, // Longueur minimale de 3 caractères
    maxlength: 50, // Longueur maximale de 50 caractères
  },
  ServiceDescription: {
    type: String,
    required: true, // La description du service est obligatoire
    trim: true, // Supprime les espaces inutiles
    minlength: 10, // Description avec au moins 10 caractères
    maxlength: 255, // Description limitée à 255 caractères
  },
}, { timestamps: true }); // Ajoute les champs createdAt et updatedAt automatiquement

// Création du modèle "Service" basé sur le schéma
const Service = mongoose.model("services", serviceSchema);

module.exports = Service; // Export du modèle pour utilisation dans le projet

