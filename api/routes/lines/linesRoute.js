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
    .select("line", "date", "lines.id", "img_url");

  res.status(200).json({ lines });
});

//------TEST CALLS TO REMOVE:
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

router.get("/who-am-i", authenticate, async (req, res) => {
  let username = req.decoded.username;
  res.status(200).json({ username });
});
//--------

// TODO - get route for 10yr history by date
// router.get("/history/:date", authenticate, async (req, res) => {
//   let dateArr = req.params.date.split("-");
//   let year = dateArr.shift();
//   let monthAndDay = dateArr.join("-");
//   let datesToFind = [];

//   let lines = await db("lines")
//     .join("users", "users.id", "=", "lines.user_id")
//     .where({ "users.username": req.decoded.username })
//     .whereIn("lines.date", [monthAndDay])
//     .select("line", "date", "lines.id");

//   res.status(200).json(lines);
// });

router.get("/:date", authenticate, async (req, res) => {
  let lines = await db("lines")
    .join("users", "users.id", "=", "lines.user_id")
    .where({ "users.username": req.decoded.username })
    .where({ "lines.date": req.params.date })
    .select("line", "date", "lines.id", "img_url")
    .first();

  res.status(200).json(lines);
});

//todo handle if line for date already exists
router.post("/", authenticate, async (req, res) => {
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
router.patch("/", authenticate, async (req, res) => {
  let userID = await db("users")
    .where({ username: req.decoded.username })
    .first();
  userID = userID.id;

  let line = await db("lines").where({ id: req.body.id });

  if (line.user_id !== userID) {
    res
      .status(401)
      .json({ message: "access denied: line does not belong to user" });
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

router.delete("/", authenticate, async (req, res) => {});

//query routes to add search functionality

module.exports = router;
