const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();

admin.initializeApp();

const firebaseConfig = {
    apiKey: "AIzaSyA_E9MYKEQQJwiWPpMBRhVODuMJbd4QvqE",
    authDomain: "social-app-demo-29231.firebaseapp.com",
    databaseURL: "https://social-app-demo-29231.firebaseio.com",
    projectId: "social-app-demo-29231",
    storageBucket: "social-app-demo-29231.appspot.com",
    messagingSenderId: "1019340444594",
    appId: "1:1019340444594:web:4cc0cb127be71ff72ecaab",
    measurementId: "G-4XSB2YM5LT"
  };


const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

app.get('/rants', (req, res) => {
    admin
        db
        .collection('rants')
        .orderBy('createdAt', 'desc')
        .get()
        .then((data) => {
            let rants = [];
            data.forEach((doc) =>{
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
        .catch((err) => console.error(err));
})

app.post('/rant', (req, res) => {
    const newRant = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    };

    admin
        db
        .collection('rants')
        .add(newRant)
        .then((doc) => {
            res.json({ message: `document ${doc.id} created successfully` });
        })
        .catch((err) => {
            res.status(500).json({error: 'something went wrong'});
            console.error(err);
        
    });
});

// Signup Route
app.post('/signup', (req,res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    };

    // TODO validate data
    let token, userId;
    db.doc(`/users/${newUser.handle}`).get()
    .then(doc => {
        if(doc.exists){
            return res.status(400).json({handle: 'This Handle Is Already Taken'});
        }else{
            return firebase
            .auth()
            .createUserWithEmailAndPassword(newUser.email, newUser.password)
        }
    })
    .then(data => {
        userId = data.user.uid;
        return data.user.getIdToken();
        
    })
    .then (idToken => {
        token = idToken;
        const userCredentials = {
            handle: newUser.handle,
            email: newUser.email,
            createdAt: new Date().toISOString(),
            userId

        };
        db.doc(`/users/${newUser.handle}`).set(userCredentials);

    })
    .then(() => {
        return res.status(201).json({token});
    })

    .catch(err => {
        console.error(err);
        if(err.code == 'auth/email-already-in-use'){
            return res.status(400).json({email: 'Email Is Already In Use'})
        } else {
            return res.status(500).json({error: err.code});
        }
        
    })

});

exports.api = functions.https.onRequest(app);