const functions = require("firebase-functions");
const app = require("express")();
const FBAuth = require("./util/fbAuth");

const { db } = require("./util/admin");

// Rant Related
const {
  getAllRants,
  postOneRant,
  getRant,
  commentOnRant,
  likeRant,
  unlikeRant,
  deleteRant
} = require("./handlers/rants");
// User Related
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
  getUserDetails,
  markNotificationsRead
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
app.get("/user/:handle", getUserDetails);
app.post("/notifications", FBAuth, markNotificationsRead);

exports.api = functions.https.onRequest(app);

// Create Notifications When A User Like's Another User's Post
exports.createNotificationOnLike = functions.firestore
  .document("likes/{id}")
  .onCreate(snapshot => {
    return db
      .doc(`/rants/${snapshot.data().rantId}`)
      .get()
      .then(doc => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "like",
            read: false,
            rantId: doc.id
          });
        }
      })
      .catch(err => console.error(err));
  });

// Delete Notifications When A User Unlike's Another User's Post
exports.deleteNotificationOnUnLike = functions.firestore
  .document("likes/{id}")
  .onDelete(snapshot => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch(err => {
        console.error(err);
        return;
      });
  });

// Create Notifications When Another User Comments a User's Post
exports.createNotificationOnComment = functions.firestore
  .document("comments/{id}")
  .onCreate(snapshot => {
    return db
      .doc(`/rants/${snapshot.data().rantId}`)
      .get()
      .then(doc => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "comment",
            read: false,
            rantId: doc.id
          });
        }
      })
      .catch(err => {
        console.error(err);
        return;
      });
  });

// Change A User's Profile Image When They Import A New One
exports.onUserImageChange = functions.firestore
  .document("/users/{userId}")
  .onUpdate(change => {
    console.log(change.before.data());
    console.log(change.after.data());
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log("image has changed");
      const batch = db.batch();
      return db
        .collection("rants")
        .where("userHandle", "==", change.before.data().handle)
        .get()
        .then(data => {
          data.forEach(doc => {
            const rant = db.doc(`/rants/${doc.id}`);
            batch.update(rant, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        });
    } else return true;
  });

// Removes All Likes And Notifications
exports.onRantDelete = functions.firestore
  .document("/rants/{rantId}")
  .onDelete((snapshot, context) => {
    const rantId = context.params.rantId;
    const batch = db.batch();
    return db
      .collection("comments")
      .where("rantId", "==", rantId)
      .get()
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db
          .collection("likes")
          .where("rantId", "==", rantId)
          .get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        });
        return db
          .collection("notifications")
          .where("rantId", "==", rantId)
          .get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch(err => console.error(err));
  });
