const mongoose = require("mongoose");

// Schéma des services
const serviceSchema = new mongoose.Schema({
    serviceName: { type: String, required: true, trim: true, minlength: 3, maxlength: 50 },
    serviceDescription: { type: String, required: true, trim: true, minlength: 10, maxlength: 255 },
}, { timestamps: true }); // Ajoute createdAt et updatedAt

// Modèle Service basé sur ce schéma
const Service = mongoose.model("services", serviceSchema);

module.exports = Service;
