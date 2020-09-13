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

app.listen(app.get("port"), () => {
  console.log(
    `${app.locals.title} is running on localhost:${app.get("port")}.`
  );
});
