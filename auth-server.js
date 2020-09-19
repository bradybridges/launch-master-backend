require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();

const environment = process.env.NODE_ENV || "development";
const configuration = require("./knexfile")[environment];
const database = require("knex")(configuration);

app.locals.title = "Auth Server";
app.use(cors());
app.use(express.json());

app.set("port", process.env.PORT || 3000);

app.get("/", (req, res) => {
  res.send("Welcome to Launch Master API");
});

app.get("/test", authenticateToken, (req, res) => {
  if (!req.user)
    return res
      .status(500)
      .json({ error: "there was a problem authenticating your token" });
  res.json({ name: req.user.name });
});

app.delete("/logout", async (req, res) => {
  try {
    if (!req.body["token"]) {
      res.status(422).send({ error: "Missing token" });
    }
    const token = req.body.token;
    await database("tokens").where("token", token).del();
    res.sendStatus(204);
  } catch (e) {
    res.status(500).json({ error: "There was a problem logging you out" });
  }
});

app.post("/login", async (req, res) => {
  const userData = req.body;
  for (let requiredParameter of ["username", "password"]) {
    if (!userData[requiredParameter]) {
      return res.status(422).send({
        error: `Expecting format: { username: <String>, password: <string>. You are missing ${requiredParameter}`,
      });
    }
  }

  try {
    const username = req.body.username;
    const password = req.body.password;
    const user = { name: username };
    const storedUser = await database("users")
      .where("username", username)
      .select();

    if (storedUser.length < 1 || storedUser[0].password !== password) {
      return res.status(401).send({ error: "Invalid username or password" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
    await database("tokens").insert({ token: refreshToken });
    res.json({ accessToken: accessToken, refreshToken: refreshToken });
  } catch (e) {
    res.status(500).json({ error: "There was a problem logging you in" });
  }
});

app.post("/create", async (req, res) => {
  const userData = req.body;
  for (let requiredParameter of ["username", "password"]) {
    if (!userData[requiredParameter]) {
      return res.status(422).json({
        error: `Expected format: { username: <String>, password: <String> }. Missing ${requiredParameter}`,
      });
    }
  }

  try {
    const username = req.body.username;
    const password = req.body.password;
    const user = { name: username };
    const newUser = { username: username, password: password };
    const existingUser = await database("users").where("username", username);
    if (existingUser.length) {
      return res.status(409).json({
        error: "We can't use that email. Please use a different one.",
      });
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
    await database("tokens").insert({ token: refreshToken });
    const id = await database("users").insert(newUser, "id");
    res
      .status(201)
      .json({ id: id, accessToken: accessToken, refreshToken: refreshToken });
  } catch (e) {
    res
      .status(500)
      .json({ error: "There was a problem creating your account" });
  }
});

app.post("/token", async (req, res) => {
  const refreshToken = req.body.token;
  const storedToken = await database("tokens")
    .where("token", refreshToken)
    .select();
  if (refreshToken == null) return res.sendStatus(401);
  if (storedToken.length < 1) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken: accessToken });
  });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
  next();
}

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}

app.listen(app.get("port"), () => {
  console.log(
    `${app.locals.title} is running on localhost:${app.get("port")}.`
  );
});
