const functions = require("firebase-functions");
const app = require("express")();
const FBAuth = require("./util/fbAuth");

const { getAllRants, postOneRant } = require("./handlers/rants");
const { signup, login, uploadImage } = require("./handlers/users");

// Rant Routes
app.get("/rants", getAllRants);
app.post("/rant", FBAuth, postOneRant);

// Users Route
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);

exports.api = functions.https.onRequest(app);
