const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const server = express();
const usersRoute = require("./routes/users/usersRoute");

server.use(cors());
server.use(helmet());
server.use(express.json());
server.use(morgan("short"));

//make routes  -- liking sptint-challenge-authentication structure
server.use("/api/users", usersRoute);

module.exports = server;
