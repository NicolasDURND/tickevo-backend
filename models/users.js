const mongoose = require("mongoose");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    token: { type: String, default: null },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: "roles", required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "services" },
    ticketsAssigned: [{ type: mongoose.Schema.Types.ObjectId, ref: "tickets" }],
    email: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, required: true },}, 
    { timestamps: true });

// Middleware pour hacher le mot de passe avant sauvegarde
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // Ne re-hashe pas si le mot de passe est inchangé

    try {
        const salt = await bcrypt.genSalt(10); // Génère un salt sécurisé
        this.password = await bcrypt.hash(this.password, salt); // Hash du mot de passe
        next();
    } catch (error) {
        next(error); // Envoie l'erreur à Mongoose si le hash échoue
    }
});

const User = mongoose.model("users", userSchema);

module.exports = User;
