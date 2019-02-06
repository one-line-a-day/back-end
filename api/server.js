const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const server = express();
const usersRoute = require("./routes/users/usersRoute");
const linesRoute = require("./routes/lines/linesRoute");

server.use(cors());
server.use(helmet());
server.use(express.json());
server.use(morgan("short"));

//make routes  -- liking sptint-challenge-authentication structure
server.use("/api/users", usersRoute);
server.use("/api/lines", linesRoute);
server.get("/", (req, res) => {
  let options = {
    root: __dirname + "/docs/"
  };
  res.sendFile("docs.html", options);
  //   res.sendFile("index.css", options);
});

module.exports = server;
