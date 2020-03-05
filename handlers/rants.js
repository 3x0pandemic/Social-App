const { db } = require("../util/admin");

//Pulls All Rants
exports.getAllRants = (req, res) => {
  db.collection("rants")
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      let rants = [];
      data.forEach(doc => {
        rants.push({
          rantId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt
          //...doc.data()
        });
      });
      return res.json(rants);
    })
    .catch(err => console.error(err));
};

//Posts One Rant
exports.postOneRant = (req, res) => {
  if (req.body.body.trim() === "") {
    return res.status(400).json({ body: "Body Must Not Be Empty" });
  }

  const newRant = {
    body: req.body.body,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0
  };

  db.collection("rants")
    .add(newRant)
    .then(doc => {
      const resRant = newRant;
      resRant.rantId = doc.id;
      res.json(resRant);
    })
    .catch(err => {
      res.status(500).json({ error: "something went wrong" });
      console.error(err);
    });
};

// Fetch One Single Rant
exports.getRant = (req, res) => {
  let rantData = {};
  db.doc(`/rants/${req.params.rantId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Rant Not Found" });
      }
      rantData = doc.data();
      rantData.rantId = doc.id;
      return db
        .collection("comments")
        .orderBy("createdAt", "desc")
        .where("rantId", "==", req.params.rantId)
        .get();
    })
    .then(data => {
      rantData.comments = [];
      data.forEach(doc => {
        rantData.comments.push(doc.data());
      });
      return res.json(rantData);
    })
    .catch(err => {
      res.status(500).json({ error: err.code });
      console.error(err);
    });
};

// Reply To A Rant
exports.commentOnRant = (req, res) => {
  if (req.body.body.trim() === "")
    return res.status(400).json({ comment: "Must Not Be Empty" });

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    rantId: req.params.rantId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl
  };

  db.doc(`/rants/${req.params.rantId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Rant Not Found" });
      }
      return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    })
    .then(() => {
      return db.collection("comments").add(newComment);
    })
    .then(() => {
      res.json(newComment);
    })
    .catch(err => {
      res.status(500).json({ error: "Something Went Wrong" });
      console.error(err);
      console.log(rantId);
    });
};

// Like A User's Post
exports.likeRant = (req, res) => {
  const likeDocument = db
    .collection("likes")
    .where("userHandle", "==", req.user.handle)
    .where("rantId", "==", req.params.rantId)
    .limit(1);

  const rantDocument = db.doc(`/rants/${req.params.rantId}`);

  let rantData = {};

  rantDocument
    .get()
    .then(doc => {
      if (doc.exists) {
        rantData = doc.data();
        rantData.rantId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: "Rant Not Found" });
      }
    })
    .then(data => {
      if (data.empty) {
        return db
          .collection("likes")
          .add({
            rantId: req.params.rantId,
            userHandle: req.user.handle
          })
          .then(() => {
            rantData.likeCount++;
            return rantDocument.update({ likeCount: rantData.likeCount });
          })
          .then(() => {
            return res.json(rantData);
          });
      } else {
        return res.status(400).json({ error: "Rant Already Liked" });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// Unlike A User's Post
exports.unlikeRant = (req, res) => {
  const likeDocument = db
    .collection("likes")
    .where("userHandle", "==", req.user.handle)
    .where("rantId", "==", req.params.rantId)
    .limit(1);

  const rantDocument = db.doc(`/rants/${req.params.rantId}`);

  let rantData = {};

  rantDocument
    .get()
    .then(doc => {
      if (doc.exists) {
        rantData = doc.data();
        rantData.rantId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: "Rant Not Found" });
      }
    })
    .then(data => {
      if (data.empty) {
        return res.status(400).json({ error: "Rant Not Liked" });
      } else {
        return db
          .doc(`/likes/${data.docs[0].id}`)
          .delete()
          .then(() => {
            rantData.likeCount--;
            return rantDocument.update({ likeCount: rantData.likeCount });
          })
          .then(() => {
            res.json(rantData);
          });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// Delete A Rant
exports.deleteRant = (req, res) => {
  const document = db.doc(`/rants/${req.params.rantId}`);
  document
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Rant Not Found" });
      }
      if (doc.data().userHandle !== req.user.handle) {
        return res.status(403).json({ error: "Unauthorized" });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({ message: "Rant Deleted Successfully" });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
