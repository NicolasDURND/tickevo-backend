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
      return res
        .status(400)
        .json({ result: false, error: "Missing or empty fields" });
    }

    // Vérifier si le username existe déjà
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res
        .status(409)
        .json({ result: false, error: "Username already exists" });
    }

    // Vérifier si l'email existe déjà
    const existingEmail = await User.findOne({ email: req.body.email });
    if (existingEmail) {
      return res
        .status(409)
        .json({ result: false, error: "Email already in use" });
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
        return res
          .status(400)
          .json({ result: false, error: "Invalid service" });
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

    res.status(201).json({
      result: true,
      message: "User created successfully",
      userId: newUser._id,
    });
  } catch (error) {
    console.error("Error in create-user:", error);
    res.status(500).json({ result: false, error: "Internal server error" });
  }
});

// Route de connexion (signin)
router.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    console.log("❌ Erreur: Champs manquants");
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    console.log(`🔎 Recherche de l'utilisateur : ${username}`);
    const user = await User.findOne({ username })
      .select("+isActive")  // ✅ Forcer l'inclusion de isActive
      .populate("roleId", "roleName");

    if (!user) {
      console.log("❌ Erreur: Utilisateur introuvable");
      return res.status(401).json({ error: "Nom d'utilisateur ou mot de passe incorrect" });
    }

    console.log(`👤 Utilisateur trouvé : ${user.username}, isActive: ${user.isActive}`);

    if (!user.isActive) {
      console.log("❌ Utilisateur désactivé, accès refusé.");
      return res.status(403).json({ error: "Connexion impossible, contactez votre administrateur." });
    }

    console.log("🔑 Vérification du mot de passe...");
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log("❌ Mot de passe incorrect");
      return res.status(401).json({ error: "Nom d'utilisateur ou mot de passe incorrect" });
    }

    console.log("✅ Connexion réussie, génération du token...");
    const newToken = uid2(32);
    user.token = newToken;
    await user.save();

    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        roleId: user.roleId ? user.roleId.roleName : null,
        token: newToken,
      },
    });
  } catch (error) {
    console.error("❌ Erreur serveur lors de la connexion:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


// Route d'inscription (signup) // Sans middleware --> A SUPPRIMER EN FIN DE PROJET
router.post("/signup", async (req, res) => {
  try {
    // Vérifier les champs obligatoires
    if (!checkBody(req.body, ["username", "password", "email", "roleId"])) {
      return res
        .status(400)
        .json({ result: false, error: "Missing or empty fields" });
    }

    // Vérifier si le username existe déjà
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res
        .status(409)
        .json({ result: false, error: "Username already exists" });
    }

    // Vérifier si l'email existe déjà
    const existingEmail = await User.findOne({ email: req.body.email });
    if (existingEmail) {
      return res
        .status(409)
        .json({ result: false, error: "Email already in use" });
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
        return res
          .status(400)
          .json({ result: false, error: "Invalid service" });
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

    res
      .status(201)
      .json({ result: true, token: newUser.token, userId: newUser._id });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ result: false, error: "Internal server error" });
  }
});

// Route GET pour récupérer tous les rôles
router.get("/roles", isAdmin, async (req, res) => {
  try {
    const roles = await Role.find({}, "_id roleName"); // Ne récupère que l'ID et le nom du rôle
    res.json({ roles }); // ✅ Retourne un objet avec la clé "roles"
  } catch (error) {
    console.error("Erreur lors de la récupération des rôles :", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des rôles" });
  }
});

// Route GET pour récupérer tous les services
router.get("/services", isAdmin, async (req, res) => {
  try {
    const services = await Service.find({}, "_id serviceName"); // Ne récupère que l'ID et le nom du service
    res.json({ services }); // ✅ Retourne un objet avec la clé "services"
  } catch (error) {
    console.error("Erreur lors de la récupération des services :", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des services" });
  }
});

// Route GET pour récupérer tous les utilisateurs
router.get("/allusers", isAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .populate("roleId", "roleName")
      .populate("serviceId", "serviceName");

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Route PATCH pour modifier un utilisateur (mise à jour partielle)
router.patch("/update/:id", isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const updateFields = req.body;

    // ✅ Supprime les champs vides (évite d'écraser avec des valeurs vides)
    Object.keys(updateFields).forEach((key) => {
      if (updateFields[key] === "") {
        delete updateFields[key];
      }
    });

    // ✅ Si `serviceId` est vide, on le passe à `null` dans la base de données
    if (updateFields.serviceId === null || updateFields.serviceId === "") {
      updateFields.serviceId = null;
    }

    // ✅ Mise à jour avec `findByIdAndUpdate`
    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true, // Retourne l'utilisateur mis à jour
      runValidators: true, // Applique les validations Mongoose sur les champs modifiés
    });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable" });
    }

    res.status(200).json({
      success: true,
      message: "Utilisateur mis à jour avec succès",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Route PATCH pour désactiver/réactiver un utilisateur
router.patch("/toggle-status/:id", isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    // ✅ Récupérer l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable" });
    }

    // ✅ Basculer l'état `isActive`
    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Utilisateur ${user.isActive ? "réactivé" : "désactivé"} avec succès`,
      isActive: user.isActive,
    });
  } catch (error) {
    console.error("Erreur lors du changement de statut de l'utilisateur:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;
