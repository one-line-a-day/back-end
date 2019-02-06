require("dotenv").config();

const express = require("express");
const router = express.Router();
const db = require("../../../data/dbConfig");

const auth = require("../../auth/auth");

//middleware functions

//------TEST ROUTES TO REMOVE:
router.get("/testcall", async (req, res) => {
  let lines = await db("lines");
  res.status(200).json(lines);
});

router.post("/testcall", async (req, res) => {
  let ids = await db("lines").insert(req.body);
  res.status(201).json({ message: "created line successfully", id: ids[0] });
});

router.get("/testcall/:date", async (req, res) => {
  let lines = await db("lines")
    .join("users", "users.id", "=", "lines.user_id")
    .where({ "lines.date": req.params.date })
    .select("line", "date", "lines.id", "img_url")
    .first();

  res.status(200).json(lines);
});

router.get("/who-am-i", auth.authenticate, async (req, res) => {
  let username = req.decoded.username;
  res.status(200).json({ username });
});
//----------END Testing/Development Routes

//routes
router.get("/", auth.authenticate, async (req, res) => {
  let lines = await db("lines")
    .join("users", "users.id", "=", "lines.user_id")
    .where({ "users.username": req.decoded.username })
    .select("line", "date", "lines.id", "img_url");

  res.status(200).json(lines);
});

router.get("/:date", auth.authenticate, async (req, res) => {
  let lines = await db("lines")
    .join("users", "users.id", "=", "lines.user_id")
    .where({ "users.username": req.decoded.username })
    .where({ "lines.date": req.params.date })
    .select("line", "date", "lines.id", "img_url")
    .first();

  res.status(200).json(lines);
});

router.get("/month/:month/year/:year", auth.authenticate, async (req, res) => {
  let lines = await db("lines")
    .join("users", "users.id", "=", "lines.user_id")
    .where({ "users.username": req.decoded.username })
    .andWhereRaw(`strftime('%m', date) = ?`, [req.params.month])
    .andWhereRaw(`strftime('%Y', date) = ?`, [req.params.year])
    .select("line", "date", "lines.id", "img_url");
  res.status(200).json(lines);
});

async function checkDate(req, res, next) {
  let checkLine = await db("lines")
    .join("users", "users.id", "=", "lines.user_id")
    .where({ "lines.date": req.body.date })
    .first();

  if (checkLine) {
    res.status(400).json({ message: "line for this date already exists" });
  } else {
    next();
  }
}

router.post("/", auth.authenticate, checkDate, async (req, res) => {
  //todo just put userID on the token...
  let { id } = await db("users")
    .where({ username: req.decoded.username })
    .first();

  let lineIDs = await db("lines").insert({ ...req.body, user_id: id });

  res
    .status(201)
    .json({ message: "line created successfully", id: lineIDs[0] });
});

async function checkLineExists(req, res, next) {
  let checkLine = await db("lines")
    .where({ id: req.body.id })
    .first();

  if (checkLine) {
    req.lineInfo = checkLine;
    next();
  } else {
    res.status(404).json({ message: `line by id: ${req.body.id} not found` });
  }
}

async function checkOwner(req, res, next) {
  let userID = await db("users")
    .where({ username: req.decoded.username })
    .first();
  userID = userID.id;

  if (req.lineInfo.user_id !== userID) {
    res
      .status(401)
      .json({ message: `access denied: line does not belong to user` });
  } else {
    next();
  }
}

router.patch(
  "/",
  auth.authenticate,
  checkLineExists,
  checkDate,
  checkOwner,
  async (req, res) => {
    await db("lines")
      .where({ id: req.body.id })
      .update(req.body);

    let updatedLine = await db("lines")
      .where({ id: req.body.id })
      .first();

    res.status(200).json(updatedLine);
    // }
  }
);

router.delete(
  "/",
  auth.authenticate,
  checkLineExists,
  checkOwner,
  async (req, res) => {
    await db("lines")
      .where({ id: req.body.id })
      .del();

    res.status(200).json({ message: "line deleted successfully" });
  }
);

//query routes to add search functionality

module.exports = router;
