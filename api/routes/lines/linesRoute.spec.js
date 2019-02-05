const request = require("supertest");

const server = require("../../server.js");
const bcrypt = require("bcryptjs");
const db = require("../../../data/dbConfig");
const auth = require("../../auth/auth");

let user1 = {
  username: "User",
  email: "stuff@things.com",
  password: bcrypt.hashSync("pass", 12)
};

let line1 = {
  line: "this is my line of the day",
  date: "2019-01-11",
  user_id: 2
};

beforeEach(async () => {
  await db("users").insert(user1);
  await db("lines").insert(line1);
});

afterEach(async () => {
  await db("lines").truncate();
  await db("users").truncate();
});

describe("lines route", () => {
  describe("/api/lines", () => {
    test("should respond 401 with no token", async () => {
      let response = await request(server).get("/api/lines");
      expect(response.status).toBe(401);
    });
    test("should respond 200 with valid token", async () => {
      let user = await db("users").first();

      let token = auth.generateToken(user);
      let response = await request(server)
        .get("/api/lines")
        .set("authorization", token);

      expect(response.status).toBe(200);
    });
    test("should not return other users lines", async () => {
      let user = await db("users").first();

      let token = auth.generateToken(user);
      let response = await request(server)
        .get("/api/lines")
        .set("authorization", token);

      expect(response.body).toEqual([]);
    });
  });
});
