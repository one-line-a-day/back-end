const request = require("supertest");

const server = require("../../server.js");

const db = require("../../../data/dbConfig");
const auth = require("../../auth/auth");
const bcrypt = require("bcryptjs");

let newUser = {
  username: "Bobbie",
  email: "stuff@dork.awe",
  password: "pass"
};

afterEach(async () => {
  await db("users").truncate();
});

describe("usersRoute", () => {
  describe("registration", () => {
    test("checks registration body for missing info", async () => {
      let missingEmail = {
        username: "Picasso1",
        password: "pass"
      };
      let missingUsername = {
        email: "testing@this.then",
        password: "pass"
      };
      let missingPass = {
        username: "steve",
        email: "testing@this.then"
      };

      let response1 = await request(server)
        .post("/api/users/register")
        .send(missingEmail);
      let response2 = await request(server)
        .post("/api/users/register")
        .send(missingUsername);
      let response3 = await request(server)
        .post("/api/users/register")
        .send(missingPass);
      expect(response1.status).toBe(400);
      expect(response2.status).toBe(400);
      expect(response3.status).toBe(400);
    });
    test("password is hashed", async () => {
      let response = await request(server)
        .post("/api/users/register")
        .send(newUser);

      let user = await db("users")
        .where({ id: response.body.id })
        .first();

      expect(user.password).not.toEqual("pass");
    });
    test("successful registration returns token", async () => {
      let body = {
        username: "SteveTheJeeves",
        email: "Jeevie@steve.com",
        password: "pass"
      };

      let response = await request(server)
        .post("/api/users/register")
        .send(body);

      expect(response.body.token).toBeTruthy();
    });
  });
  describe("login", () => {
    test("checks login info for username and password", async () => {
      let noName = { password: "stuff" };
      let noPass = { username: "ugly" };

      let res1 = await request(server)
        .post("/api/users/login")
        .send(noName);
      let res2 = await request(server)
        .post("/api/users/login")
        .send(noPass);

      expect(res1.status).toBe(400);
      expect(res2.status).toBe(400);
    });
    test("email address sent as username will find appropriate user", async () => {
      await request(server)
        .post("/api/users/register")
        .send(newUser);

      let findMe = { username: "stuff@dork.awe", password: "pass" };
      let response = await request(server)
        .post("/api/users/login")
        .send(findMe);

      expect(response.body.username).toEqual("Bobbie");
    });
    test("if username doesnt exist, return 404", async () => {
      let response = await request(server)
        .post("/api/users/login")
        .send({ username: "RickyBobby", password: "pass" });
      expect(response.status).toBe(404);
    });
  });
  test("incorrect password should return 401", async () => {
    await request(server)
      .post("/api/users/register")
      .send(newUser);

    let badInfo = {
      username: "Bobbie",
      password: "notpass"
    };

    let response = await request(server)
      .post("/api/users/login")
      .send(badInfo);

    expect(response.status).toBe(401);
  });
  test("successful login returns token", async () => {
    await request(server)
      .post("/api/users/register")
      .send(newUser);

    let goodInfo = {
      username: "Bobbie",
      password: "pass"
    };

    let response = await request(server)
      .post("/api/users/login")
      .send(goodInfo);

    expect(response.body.token).toBeTruthy();
  });

  describe("Patch user endpoint info", () => {
    test("should fail without token", async () => {
      await request(server)
        .post("/api/users/register")
        .send(newUser);

      let response = await request(server)
        .patch("/api/users/1")
        .send({ email: "somethingElse" });

      expect(response.status).toBe(401);
    });
    test("should update info", async () => {
      let stuff = await request(server)
        .post("/api/users/register")
        .send(newUser);

      let token = stuff.body.token;

      let patch = await request(server)
        .patch("/api/users/1")
        .send({ email: "something@else.wee" })
        .set("authorization", token);

      let response = await db("users").first();

      expect(response.email).toEqual("something@else.wee");
    });
  });
});
