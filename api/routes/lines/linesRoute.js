const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../../../data/dbConfig");

const jwtKey = process.env.JWT_SECRET;
//middleware functions
function authenticate(req, res, next) {
  const token = req.get("Authorization");

  if (token) {
    jwt.verify(token, jwtKey, (err, decoded) => {
      if (err) return res.status(401).json(err);

      req.decoded = decoded;

      next();
    });
  } else {
    return res.status(401).json({
      error: "No token provided, must be set on the Authorization Header"
    });
  }
}

//routes
router.get("/", authenticate, async (req, res) => {
  let lines = await db("lines")
    .join("users", "users.id", "=", "lines.user_id")
    .where({ "users.username": req.decoded.username })
    .select("line", "date");

  res.status(200).json({ lines });
});

router.get("/test", authenticate, async (req, res) => {
  let lines = await db("lines");
  let decoded = req.decoded.username;
  res.status(200).json({ decoded });
});

router.get("/:date", authenticate, async (req, res) => {});
module.exports = router;
