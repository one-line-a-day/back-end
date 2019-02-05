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
//todo handle if line for date already exists
router.post("/", auth.authenticate, async (req, res) => {
  //todo just put userID on the token...
  let { id } = await db("users")
    .where({ username: req.decoded.username })
    .first();

  let lineIDs = await db("lines").insert({ ...req.body, user_id: id });

  res
    .status(201)
    .json({ message: "line created successfully", id: lineIDs[0] });
});

//todo handle bad request info
router.patch("/", auth.authenticate, async (req, res) => {
  let userID = await db("users")
    .where({ username: req.decoded.username })
    .first();
  userID = userID.id;

  let line = await db("lines")
    .where({ id: req.body.id })
    .first();

  if (line.user_id !== userID) {
    res
      .status(401)
      .json({ message: `access denied: line does not belong to user` });
  } else {
    await db("lines")
      .where({ id: req.body.id })
      .update(req.body);

    let updatedLine = await db("lines")
      .where({ id: req.body.id })
      .first();

    res.status(200).json(updatedLine);
  }
});

router.delete("/", auth.authenticate, async (req, res) => {
  let userID = await db("users")
    .where({ username: req.decoded.username })
    .first();
  userID = userID.id;

  let line = await db("lines")
    .where({ id: req.body.id })
    .first();

  if (line.user_id !== userID) {
    res
      .status(401)
      .json({ message: "access denied: line does not belong to user" });
  } else {
    await db("lines")
      .where({ id: req.body.id })
      .del();

    res.status(200).json({ message: "line deleted successfully" });
  }
});

//query routes to add search functionality

module.exports = router;
