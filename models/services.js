const mongoose = require("mongoose");

// Définition du schéma pour les services
const serviceSchema = new mongoose.Schema({
    serviceName: { type: String, required: true, trim: true, minlength: 3, maxlength: 50 },
    serviceDescription: { type: String, required: true, trim: true, minlength: 10, maxlength: 255 },
}, { timestamps: true });

// Création du modèle "Services" basé sur le schéma
const Service = mongoose.model("services", serviceSchema);

module.exports = Service;
