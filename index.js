const functions = require("firebase-functions");
const app = require("express")();
const FBAuth = require("./util/fbAuth");

const {
  getAllRants,
  postOneRant,
  getRant,
  commentOnRant,
  likeRant,
  unlikeRant,
  deleteRant
} = require("./handlers/rants");

const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser
} = require("./handlers/users");

// Rant Routes
app.get("/rants", getAllRants);
app.post("/rant", FBAuth, postOneRant);
app.get("/rant/:rantId", getRant);
app.get("/rant/:rantId/like", FBAuth, likeRant);
app.get("/rant/:rantId/unlike", FBAuth, unlikeRant);
app.delete("/rant/:rantId", FBAuth, deleteRant);
app.post("/rant/:rantId/comment", FBAuth, commentOnRant);

// Users Route
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);

exports.api = functions.https.onRequest(app);
