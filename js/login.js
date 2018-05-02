//

  // Initialize Firebase
  var config = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DB_URL,
    projectId: process.env.FIREBASE_PJ_ID,
    storageBucket: '',
    messagingSenderId: process.env.FIREBASE_MESSAGING_ID
  };

  firebase.initializeApp(config);
socket.on('not-logged-in', function() {
    $('.login-form').css({
        'display': 'inherit'
    });
})
$("#loginForm").submit(function(e) {
    e.preventDefault();
});

function login() {
    var loginData = {
        email: $("#email").val(),

        password: $("#password").val()
    }
    returningUser(loginData);
}
socket.on('not-logged-in-msg', function() {
    toastr.error("You cannot chat if you're not signed in.")
})

function callSignUp() {
    $('.login-form').css({
        'display': 'none'
    });
    $('.signup-form').css({
        'display': 'inherit'
    });
}

function signup() {
    var signUpData = {
        email: $('#signupemail').val(),

        password: $('#signuppassword').val(),

        displayName: $('#displayname').val()

    }
    socket.emit('new-user', signUpData);
}
socket.on('signup-error', function(error) {
    toastr.error(error);
})
socket.on('signup-success', function() {
    toastr.success('Sign up successfully completed!')
    $('.signup-form').css({
        'display': 'none'
    });
})

// Account login
function returningUser(loginData) {
    firebase.auth().signInWithEmailAndPassword(loginData.email, loginData.password).then(function(user) {
        $('.login-form').css({
            'display': 'none'
        });
        toastr.success('Successfully logged in as ' + username);

    }).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        if (error) {
            toastr.error(errorMessage);
        }

    });

}
