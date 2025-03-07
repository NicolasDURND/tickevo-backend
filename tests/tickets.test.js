const request = require("supertest");
const app = require("../app");

test("L'API /tickets/last doit répondre avec un code 200", async () => {
  const response = await request(app).get("/tickets/last");
  expect(response.status).toBe(200);
});
