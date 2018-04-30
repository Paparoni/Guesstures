var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var firebase = require("firebase");
var cookies = require("./js/cookies.js");


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

// connects to the authentication server on firebase
var authentication = firebase.initializeApp({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DB_URL,
    projectId: process.env.FIREBASE_PJ_ID,
    storageBucket: '',
    messagingSenderId: process.env.FIREBASE_MESSAGING_ID
});

// Get a database reference
var _database = firebase.database()

function initializeDatabase() {

}
io.on('connection', function(socket) {
    var ADMINS = ['aj'];
    var MODS = [];
    // test function
    socket.on('echo', function() {
        console.log("echo");
    })

    // function checks if someone is already logged in
    function isLoggedIn() {
        var user = firebase.auth().currentUser;
        if (user) {
            return true
        } else {
            return false
        }
    }

    function Name() {
        if (isLoggedIn()) {
            return firebase.auth().currentUser.displayName;
        }
    }

    function getAuthority() {
        var user = firebase.auth().currentUser;
        function isAdmin(user) {
            if (ADMINS.includes(user.displayName.toLowerCase())) {
                return true
            } else {
                return false
            }
        }

        function isMod(user) {
            if (MODS.includes(user.displayName.toLowerCase())) {
                return true
            } else {
                return false
            }
        }
        if (isAdmin(user)) {
            return 2
        } else if (isMod(user)) {
            return 1
        } else {
            return 0;
        }
    }

    if (!isLoggedIn()) {
        socket.emit('not-logged-in')
    }
    // Account creation
    socket.on('new-user', function(signUpData) {
        firebase.auth().createUserWithEmailAndPassword(signUpData.email, signUpData.password).then(function(user) {
            // checking if the display name is taken
            var userGetRef = _database.ref('/userData/usernames')
            var userSetRef = _database.ref('/userData/')
            var userSoloRef = _database.ref('/users/' + user.uid + '/')
            var userNameArray = [];
            userGetRef.once('value').then(function(snapshot) {
                userNameArray = JSON.parse(snapshot.val());
                if (userNameArray.includes(signUpData.displayName)) {

                    user.delete().then(function() {

                    }).catch(function(error) {
                        throw new Error(error);
                    });
                    socket.emit('signup-error', 'This display name is taken.');
                } else {
                    userSoloRef.set({
                        authority: 0
                    })
                    user.updateProfile({
                        displayName: signUpData.displayName,
                    }).then(function() {
                        userNameArray.push(signUpData.displayName);
                        userSetRef.set({
                            usernames: JSON.stringify(userNameArray)
                        })
                    }).catch(function(error) {
                        // An error happened.
                    });
                    socket.emit('signup-success');

                }

            }).catch(function(error) {

            });

        }).catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            socket.emit('signup-error', errorMessage);
        });
    })

    // Account login
    socket.on('returning-user', function(loginData) {
        firebase.auth().signInWithEmailAndPassword(loginData.email, loginData.password).then(function(user) {
            socket.emit('login-success', Name());

        }).catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            if (error) {
                socket.emit("login-error", errorMessage);
            }

        });

    })
    socket.on('chat message', function(msg) {
        // when the client sends a message check if they're logged in 
        if (isLoggedIn()) {
            var message = {
                text: msg,
                sender: Name(),
                authority: getAuthority()
            }
            io.emit('chat message', message);
        } else {
            socket.emit('not-logged-in-msg');
        }

    });
});

http.listen(port, function() {
    console.log('Guesstures online on port: ' + port);
});
