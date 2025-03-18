const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Schéma de l'utilisateur
const userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true }, // Nom d'utilisateur unique
    password: { type: String, required: true }, // Mot de passe
    token: { type: String, default: null }, // Token d'authentification
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: "roles", required: true }, // Lien vers le rôle
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "services" }, // Lien vers le service
    ticketsAssigned: [{ type: mongoose.Schema.Types.ObjectId, ref: "tickets" }], // Tickets assignés
    email: { type: String, required: true, unique: true }, // Email unique
    isActive: { type: Boolean, default: true }, // Statut actif
    createdBy: { type: String, required: true }, // Qui a créé cet utilisateur
}, { timestamps: true }); // Ajoute createdAt et updatedAt

// (Middleware mongoose) Avant de sauvegarder, on hache le mot de passe s'il a changé
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // Pas de changement, passe au suivant

    try {
        const salt = await bcrypt.genSalt(10); // Génère un salt
        this.password = await bcrypt.hash(this.password, salt); // Hache le mot de passe
        next();
    } catch (error) {
        next(error); // Gère l'erreur si besoin
    }
});

const User = mongoose.model("users", userSchema);

module.exports = User;
