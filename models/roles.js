const mongoose = require("mongoose");

// Définition du schéma pour les rôles
const roleSchema = new mongoose.Schema({
    roleName: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 50 },
    levelRole: { type: Number, required: true, min: 0 },
    roleDescription: { type: String, trim: true, minlength: 10, maxlength: 255 },
}, { timestamps: true }); // Ajoute createdAt et updatedAt automatiquement

// Création du modèle "Roles" basé sur le schéma
const Role = mongoose.model("roles", roleSchema);

module.exports = Role;