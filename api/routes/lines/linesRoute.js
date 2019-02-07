require("dotenv").config();

const express = require("express");
const router = express.Router();
const db = require("../../../data/dbConfig");

const auth = require("../../auth/auth");

const mw = require("./middleware/linesMiddleware");

//------TEST ROUTES TO REMOVE:
router.get("/testcall", async (req, res) => {
  try {
    let lines = await db("lines");
    res.status(200).json(lines);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/testcall", async (req, res) => {
  try {
    let ids = await db("lines").insert(req.body);
    res.status(201).json({ message: "created line successfully", id: ids[0] });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/testcall/:date", async (req, res) => {
  try {
    let lines = await db("lines")
      .join("users", "users.id", "=", "lines.user_id")
      .where({ "lines.date": req.params.date })
      .select("line", "date", "lines.id", "img_url")
      .first();

    res.status(200).json(lines);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/who-am-i", auth.authenticate, async (req, res) => {
  let username = req.decoded.username;
  res.status(200).json({ username });
});
//----------END Testing/Development Routes

//routes
router.get("/", auth.authenticate, mw.getUsersLines);
router.get(
  "/id/:id",
  auth.authenticate,
  mw.checkLineExists,
  mw.checkOwner,
  mw.getLineById
);
router.get("/:date", auth.authenticate, mw.getLinesByDate);
router.get(
  "/month/:month/year/:year",
  auth.authenticate,
  mw.getLinesByMonthYear
);
router.post("/", auth.authenticate, mw.checkDate, mw.addLine);
router.patch(
  "/:id",
  auth.authenticate,
  mw.checkLineExists,
  mw.checkDate,
  mw.checkOwner,
  mw.updateLine
);
router.delete(
  "/:id",
  auth.authenticate,
  mw.checkLineExists,
  mw.checkOwner,
  mw.deleteLine
);

module.exports = router;
