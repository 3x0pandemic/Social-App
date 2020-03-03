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
