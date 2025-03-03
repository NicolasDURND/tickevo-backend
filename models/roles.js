const mongoose = require("mongoose");

// Définition du schéma pour les rôles
const roleSchema = new mongoose.Schema({
  roleName: {
    type: String,
    required: true, // Le nom du rôle est obligatoire
    unique: true,
    trim: true, // Supprime les espaces inutiles
    minlength: 3, // Longueur minimale de 3 caractères
    maxlength: 50, // Longueur maximale de 50 caractères
  },
  levelRole: {
    type: Number,
    required: true, // Le niveau du rôle est obligatoire
    min: 0, // Empêche les valeurs négatives
  },
  roleDescription: {
    type: String,
    trim: true, // Supprime les espaces inutiles
    minlength: 10, // Description avec au moins 10 caractères
    maxlength: 255, // Description limitée à 255 caractères
  },
}, { timestamps: true }); // Ajoute les champs createdAt et updatedAt automatiquement

// Création du modèle "Role" basé sur le schéma
const Role = mongoose.model("roles", roleSchema);

module.exports = Role; // Export du modèle pour utilisation dans le projet

