require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();

// const environment = process.env.NODE_ENV || "development";
// const configuration = require("./knexfile")[environment];
// const database = require("knex")(configuration);

app.locals.title = "Auth Server";
app.use(cors());
app.use(express.json());

app.set("port", process.env.PORT || 3000);

app.get("/test", authenticateToken, (req, res) => {
  res.json({ name: req.user.name });
});

app.post("/login", (req, res) => {
  const username = req.body.username;

  const user = { name: username };
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);

  res.json({ accessToken: accessToken });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    console.log(user);
    req.user = user;
    next();
  });
  next();
}

app.listen(app.get("port"), () => {
  console.log(
    `${app.locals.title} is running on localhost:${app.get("port")}.`
  );
});
