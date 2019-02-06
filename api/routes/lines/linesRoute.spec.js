const request = require("supertest");

const server = require("../../server.js");
const bcrypt = require("bcryptjs");
const db = require("../../../data/dbConfig");
const auth = require("../../auth/auth");

var user1 = {
  username: "User1",
  email: "stuff@things.com",
  password: bcrypt.hashSync("pass", 12)
};

var user2 = {
  username: "User2",
  email: "tuff@thincom",
  password: bcrypt.hashSync("pass", 12)
};

var line1 = {
  line: "this is my line of the day",
  date: "2019-01-11",
  user_id: 2
};

beforeEach(async () => {
  await db("lines").truncate();
  await db("users").truncate();
});

afterEach(async () => {
  await db("lines").truncate();
  await db("users").truncate();
});

describe("lines route", () => {
  describe("GET/api/lines", () => {
    test("should respond 401 with no token", async () => {
      let response = await request(server).get("/api/lines");
      expect(response.status).toBe(401);
    });
    test("should respond 200 with valid token", async () => {
      await db("users").insert(user1);

      let user = await db("users").first();

      let token = auth.generateToken(user);
      let response = await request(server)
        .get("/api/lines")
        .set("authorization", token);

      expect(response.status).toBe(200);
    });
    test("should not return other users lines & should return array", async () => {
      await db("users").insert(user1);

      let user = await db("users").first();

      let token = auth.generateToken(user);
      let response = await request(server)
        .get("/api/lines")
        .set("authorization", token);

      expect(response.body).toEqual([]);
    });
  });
  describe("GET/api/lines/:date", () => {
    test("should return item by date", async () => {
      await db("users").insert(user1);
      await db("users").insert(user2);
      await db("lines").insert(line1);
      let user = await db("users")
        .where({ id: 2 })
        .first();

      let token = auth.generateToken(user);
      let response = await request(server)
        .get("/api/lines/2019-01-11")
        .set("authorization", token);

      expect(response.body.date).toEqual("2019-01-11");
    });
  });
});
