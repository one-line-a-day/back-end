require("dotenv").config();

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../../data/dbConfig");
const auth = require("../../auth/auth");
//middleware functions
function checkRegistration(req, res, next) {
  if (!req.body.username || !req.body.email || !req.body.password) {
    res.status(400).json({
      message: `Please send username, email, and password fields for registration`
    });
  } else {
    next();
  }
}

function hashPassword(req, res, next) {
  req.body.password = bcrypt.hashSync(req.body.password, 12);
  next();
}

function checkLogin(req, res, next) {
  if (req.body.username && req.body.password) {
    next();
  } else {
    res
      .status(400)
      .json({ message: "Please provide both username and password" });
  }
}

async function findUser(req, res, next) {
  let user = await db("users")
    .where({ username: req.body.username })
    .first();

  if (!user) {
    user = await db("users")
      .where({ email: req.body.username })
      .first();
    if (!user) {
      res.status(404).json({ message: "user not found" });
    }
  }

  req.user = user;
  next();
}

function checkPassword(req, res, next) {
  if (req.user && bcrypt.compareSync(req.body.password, req.user.password)) {
    next();
  } else {
    res.status(401).json({ message: "incorrect password" });
  }
}

// routes

router.post("/register", checkRegistration, hashPassword, async (req, res) => {
  let ids = await db("users").insert(req.body);

  let user = await db("users")
    .where({ id: ids[0] })
    .first();

  let token = auth.generateToken(user);

  res
    .status(201)
    .json({ message: "Successfully created new User", id: ids[0], token });
});

router.post("/login", checkLogin, findUser, checkPassword, async (req, res) => {
  if (req.user) {
    let token = auth.generateToken(req.user);
    res
      .status(200)
      .json({ message: "login success", username: req.user.username, token });
  }
});

router.get("/testcall", async (req, res) => {
  let users = await db("users");
  res.status(200).json(users);
});

router.patch("/", auth.authenticate, async (req, res) => {
  let userID = await db("users")
    .where({ username: req.decoded.username })
    .first();
  userID = userID.id;

  if (req.body.password) {
    req.body.password = bcrypt.hashSync(req.body.password, 12);
  }

  await db("users")
    .where({ username: req.decoded.username })
    .update(req.body);

  let updatedUser = await db("users")
    .where({ id: userID })
    .select("username", "email", "name")
    .first();
  // let user = await db('users').where({ })
  res.status(200).json(updatedUser);
});

module.exports = router;
