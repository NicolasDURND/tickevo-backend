const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/users");
const Role = require("../models/roles");

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION_STRING);

  const role = new Role({
    roleName: "User",
    levelRole: 1,
    roleDescription: "Utilisateur standard"
  });

  await role.save();
  global.roleId = role._id;
});

afterAll(async () => {
  await User.deleteMany({});
  await Role.deleteMany({});
  await mongoose.connection.close();
});

describe("POST /signup", () => {
  it("Refuse si un champ obligatoire est manquant", async () => {
    const res = await request(app).post("/users/signup").send({
      username: "testuser",
      password: "password123",
      roleId: global.roleId
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Missing or empty fields");
  });

  it("Refuse si le username existe déjà", async () => {
    await User.create({
      username: "existingUser",
      password: "password123",
      email: "unique@test.com",
      roleId: global.roleId,
      createdBy: "self"
    });

    const res = await request(app).post("/users/signup").send({
      username: "existingUser",
      password: "password123",
      email: "newemail@test.com",
      roleId: global.roleId
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toBe("Username already exists");
  });

  it("Refuse si l'email existe déjà", async () => {
    await User.create({
      username: "uniqueUser",
      password: "password123",
      email: "existing@test.com",
      roleId: global.roleId,
      createdBy: "self"
    });

    const res = await request(app).post("/users/signup").send({
      username: "newUser",
      password: "password123",
      email: "existing@test.com",
      roleId: global.roleId
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toBe("Email already in use");
  });

  it("Crée un utilisateur avec succès", async () => {
    const res = await request(app).post("/users/signup").send({
      username: "validUser",
      password: "password123",
      email: "validuser@test.com",
      roleId: global.roleId
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.result).toBe(true);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("userId");
  });
});
