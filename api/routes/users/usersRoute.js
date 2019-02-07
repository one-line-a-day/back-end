//supertest breaks down if dotenv not included here for JWT secret
require("dotenv").config();

const express = require("express");
const router = express.Router();
// const bcrypt = require("bcryptjs");

const db = require("../../../data/dbConfig");
const auth = require("../../auth/auth");
const mw = require("./middleware/usersMiddleware");
//routes
router.post(
  "/register",
  mw.checkRegistration,
  mw.checkNameAndEmail,
  mw.hashPassword,
  mw.insertUser
);
router.post("/login", mw.checkLogin, mw.findUser, mw.checkPassword, mw.logIn);
router.patch(
  "/:id",
  auth.authenticate,
  mw.checkIdParam,
  mw.hashPassword,
  mw.updateUser
);
router.delete(
  "/:id",
  auth.authenticate,
  mw.checkIdParam,
  mw.deleteUserAndLines
);

//TO REMOVE - For testing
router.get("/testcall", async (req, res) => {
  try {
    let users = await db("users");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
