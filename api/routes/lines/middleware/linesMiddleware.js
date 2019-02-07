const db = require("../../../../data/dbConfig");

module.exports.getUsersLines = async (req, res, next) => {
  try {
    let lines = await db("lines")
      .join("users", "users.id", "=", "lines.user_id")
      .where({ "users.username": req.decoded.username })
      .select("line", "date", "lines.id", "img_url");

    res.status(200).json(lines);
  } catch (err) {
    res.status(500).json(err);
  }
};
module.exports.getLineById = async (req, res, next) => {
  try {
    let lines = await db("lines")
      .join("users", "users.id", "=", "lines.user_id")
      .where({ "users.username": req.decoded.username })
      .where({ "lines.id": req.params.id })
      .select("line", "date", "lines.id", "img_url")
      .first();

    res.status(200).json(lines);
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports.getLinesByDate = async (req, res, next) => {
  try {
    let lines = await db("lines")
      .join("users", "users.id", "=", "lines.user_id")
      .where({ "users.username": req.decoded.username })
      .where({ "lines.date": req.params.date })
      .select("line", "date", "lines.id", "img_url")
      .first();

    res.status(200).json(lines);
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports.getLinesByMonthYear = async (req, res, next) => {
  try {
    let lines = await db("lines")
      .join("users", "users.id", "=", "lines.user_id")
      .where({ "users.username": req.decoded.username })
      .andWhereRaw(`strftime('%m', date) = ?`, [req.params.month])
      .andWhereRaw(`strftime('%Y', date) = ?`, [req.params.year])
      .select("line", "date", "lines.id", "img_url");
    res.status(200).json(lines);
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports.checkDate = async (req, res, next) => {
  if (req.body.date) {
    try {
      let checkLine = await db("lines")
        .join("users", "users.id", "=", "lines.user_id")
        .where({ "lines.date": req.body.date })
        .where({ "users.name": req.decoded.username })
        .first();

      if (checkLine) {
        res.status(400).json({ message: "line for this date already exists" });
      } else {
        next();
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    next();
  }
};

module.exports.addLine = async (req, res, next) => {
  // could put ID on token instead....
  try {
    let { id } = await db("users")
      .where({ username: req.decoded.username })
      .first();

    let lineIDs = await db("lines").insert({ ...req.body, user_id: id });

    res
      .status(201)
      .json({ message: "line created successfully", id: lineIDs[0] });
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports.checkLineExists = async (req, res, next) => {
  try {
    let checkLine = await db("lines")
      .where({ id: req.params.id })
      .first();

    if (checkLine) {
      req.lineInfo = checkLine;
      next();
    } else {
      res
        .status(404)
        .json({ message: `line by id: ${req.params.id} not found` });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports.checkOwner = async (req, res, next) => {
  try {
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
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports.updateLine = async (req, res, next) => {
  try {
    await db("lines")
      .where({ id: req.params.id })
      .update(req.body);

    let updatedLine = await db("lines")
      .where({ id: req.params.id })
      .first();

    res.status(200).json(updatedLine);
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports.deleteLine = async (req, res) => {
  try {
    await db("lines")
      .where({ id: req.params.id })
      .del();

    res.status(200).json({ message: "line deleted successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
};
