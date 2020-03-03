const functions = require("firebase-functions");

const app = require("express")();

const FBAuth = require("./util/fbAuth");

const { getAllRants, postOneRant } = require("./handlers/rants");
const { signup, login } = require("./handlers/users");

// Rant Routes
app.get("/rants", getAllRants);
app.post("/rant", FBAuth, postOneRant);

// Users Route
app.post("/signup", signup);
app.post("/login", login);

exports.api = functions.https.onRequest(app);
