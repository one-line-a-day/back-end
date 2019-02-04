const request = require("supertest");

const server = require("../../server.js");

const db = require("../../../data/dbConfig");

afterEach(async () => {
  await db("lines").truncate();
});
