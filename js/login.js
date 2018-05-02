//
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
    socket.emit('returning-user', loginData)
}
socket.on('login-error', function(msg) {
    toastr.error(msg);
})
socket.on('login-success', function(username) {
    $('.login-form').css({
        'display': 'none'
    });
    toastr.success('Successfully logged in as ' + username);
})
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
