const express = require("express");
const router = express.Router();
const uid2 = require("uid2");

require("../models/connection"); // Connexion MongoDB
const User = require("../models/users");
const Role = require("../models/roles");
const Service = require("../models/services");
const { checkBody } = require("../modules/checkBody");
const bcrypt = require("bcrypt");
const isAdmin = require("../middlewares/isAdmin"); // Import du middleware admin;
const isEmployeeOrTechnicienOrAdmin = require("../middlewares/isEmployeeOrTechnicienOrAdmin");

// Route de création d'un utilisateur par un admin
router.post("/signupAdmin", isAdmin, async (req, res) => {
  try {
    // Vérifier les champs obligatoires
    if (!checkBody(req.body, ["username", "password", "email", "roleId"])) {
      return res.status(400).json({ result: false, error: "Missing or empty fields" });
    }

    // Vérifier si le username existe déjà
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(409).json({ result: false, error: "Username already exists" });
    }

    // Vérifier si l'email existe déjà
    const existingEmail = await User.findOne({ email: req.body.email });
    if (existingEmail) {
      return res.status(409).json({ result: false, error: "Email already in use" });
    }

    // Vérifier si le rôle existe
    const role = await Role.findById(req.body.roleId);
    if (!role) {
      return res.status(400).json({ result: false, error: "Invalid role" });
    }

    // Vérifier si le service existe (facultatif)
    let service = null;
    if (req.body.serviceId) {
      service = await Service.findById(req.body.serviceId);
      if (!service) {
        return res.status(400).json({ result: false, error: "Invalid service" });
      }
    }

    // Création de l'utilisateur avec l'ID de l'admin comme createdBy
    const newUser = new User({
      username: req.body.username,
      password: req.body.password, // Le mot de passe sera haché automatiquement avant l'enregistrement
      email: req.body.email,
      roleId: role._id,
      serviceId: service ? service._id : null,
      createdBy: req.user._id, // Assignation de l'admin qui crée l'utilisateur
    });

    await newUser.save();

    res.status(201).json({ result: true, message: "User created successfully", userId: newUser._id });

  } catch (error) {
    console.error("Error in create-user:", error);
    res.status(500).json({ result: false, error: "Internal server error" });
  }
});

// Route de connexion (signin)
router.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: "Utilisateur introuvable" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }

    // ✅ Génération d’un nouveau token pour cet utilisateur
    const newToken = uid2(32);
    user.token = newToken; // ✅ Mise à jour du token en base
    await user.save(); // ✅ Sauvegarde du token en BDD

    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        token: newToken, // ✅ On renvoie bien le token au frontend
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});


// Route d'inscription (signup) // Sans middleware --> A SUPPRIMER EN FIN DE PROJET
router.post("/signup", async (req, res) => {
  try {
    // Vérifier les champs obligatoires
    if (!checkBody(req.body, ["username", "password", "email", "roleId"])) {
      return res.status(400).json({ result: false, error: "Missing or empty fields" });
    }

    // Vérifier si le username existe déjà
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(409).json({ result: false, error: "Username already exists" });
    }

    // Vérifier si l'email existe déjà
    const existingEmail = await User.findOne({ email: req.body.email });
    if (existingEmail) {
      return res.status(409).json({ result: false, error: "Email already in use" });
    }

    // Vérifier si le rôle existe
    const role = await Role.findById(req.body.roleId);
    if (!role) {
      return res.status(400).json({ result: false, error: "Invalid role" });
    }

    // Vérifier si le service existe (facultatif)
    let service = null;
    if (req.body.serviceId) {
      service = await Service.findById(req.body.serviceId);
      if (!service) {
        return res.status(400).json({ result: false, error: "Invalid service" });
      }
    }

    // Création de l'utilisateur (hachage géré dans le modèle avec pre("save"))
    const newUser = new User({
      username: req.body.username,
      password: req.body.password, // Le mot de passe sera haché automatiquement avant l'enregistrement
      email: req.body.email,
      roleId: role._id,
      serviceId: service ? service._id : null,
      createdBy: "self", // L'utilisateur se crée lui-même
    });

    await newUser.save();

    res.status(201).json({ result: true, token: newUser.token, userId: newUser._id });

  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ result: false, error: "Internal server error" });
  }
});

module.exports = router;
