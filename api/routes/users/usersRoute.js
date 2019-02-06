//supertest breaks down if dotenv not included here for JWT secret
require("dotenv").config();

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const db = require("../../../data/dbConfig");
const auth = require("../../auth/auth");

//routes
router.post(
  "/register",
  checkRegistration,
  checkNameAndEmail,
  hashPassword,
  insertUser
);
router.post("/login", checkLogin, findUser, checkPassword, logIn);
router.patch("/:id", auth.authenticate, checkIdParam, hashPassword, updateUser);
router.delete("/:id", auth.authenticate, checkIdParam, deleteUserAndLines);

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
  if (req.body.password) {
    req.body.password = bcrypt.hashSync(req.body.password, 12);
  }
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
  try {
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
  } catch (err) {
    res.status(400).json(err);
  }
}

function checkPassword(req, res, next) {
  if (req.user && bcrypt.compareSync(req.body.password, req.user.password)) {
    next();
  } else {
    res.status(401).json({ message: "incorrect password" });
  }
}

async function checkNameAndEmail(req, res, next) {
  try {
    let name = await db("users")
      .where({ username: req.body.username })
      .first();

    let email = await db("users")
      .where({ email: req.body.email })
      .first();

    if (name) {
      res.status(400).json({ message: "username taken" });
    } else if (email) {
      res.status(400).json({ message: "email taken" });
    } else {
      next();
    }
  } catch (err) {
    res.status(500).json(err);
  }
}

async function insertUser(req, res, next) {
  try {
    let ids = await db("users").insert(req.body);

    let user = await db("users")
      .where({ id: ids[0] })
      .first();

    let token = auth.generateToken(user);

    res
      .status(201)
      .json({ message: "Successfully created new User", id: ids[0], token });
  } catch (err) {
    res.status(500).json(err);
  }
}

async function logIn(req, res, next) {
  try {
    if (req.user) {
      let token = auth.generateToken(req.user);
      res
        .status(200)
        .json({ message: "login success", username: req.user.username, token });
    }
  } catch (err) {
    res.status(500).json(err);
  }
}

async function checkIdParam(req, res, next) {
  try {
    let userID = await db("users")
      .where({ username: req.decoded.username })
      .first();
    userID = userID.id;
    if (Number(req.params.id) !== userID) {
      res.status(404).json({
        message: "you may only update/delete yourself"
      });
    } else {
      next();
    }
  } catch (err) {
    res.status(500).json(err);
  }
}

async function updateUser(req, res, next) {
  try {
    await db("users")
      .where({ username: req.decoded.username })
      .update(req.body);

    let updatedUser = await db("users")
      .where({ id: req.params.id })
      .select("username", "email", "name")
      .first();

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
}

async function deleteUserAndLines(req, res, next) {
  try {
    await db("users")
      .where({ id: req.params.id })
      .del();

    await db("lines")
      .where({ user_id: req.params.id })
      .del();

    res
      .status(200)
      .json({ message: `user and corresponding entries successfully deleted` });
  } catch (err) {
    res.status(500).json(err);
  }
}
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
