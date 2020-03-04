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
    createdAt: new Date().toISOString()
  };

  db.collection("rants")
    .add(newRant)
    .then(doc => {
      res.json({ message: `document ${doc.id} created successfully` });
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

// Reply To A Comment
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

  db.doc(`/rants/${req.params.rantId}`).get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Rant Not Found" });
      }
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
