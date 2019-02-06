const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const server = express();
const usersRoute = require("./routes/users/usersRoute");
const linesRoute = require("./routes/lines/linesRoute");

const enableCors = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
};

const corsOptions = {
	origin: function (origin, callback) {
		if (origin === process.env.FRONTEND_URL || !origin) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
	optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

server.use(enableCors);
server.use(cors(corsOptions));
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
