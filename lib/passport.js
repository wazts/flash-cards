// pass.js
//
// All the passport functions


var User = require('../models/user');
var PasswordHash = require('./password');

// --- Passport
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

// Serialize sessions
passport.serializeUser(function(user, done) {
    done(null, user._id);
});

// Deserialize
passport.deserializeUser(function(id, done) {
    User.findOne({_id:id}, function(err, user){
        done(err, user);
    });
});

// --- Simple stratagey
passport.use('login', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
    },
    function(username, password, done) {
        User.findOne({username_lower: username.toLowerCase()}, function(err, user){
            if (err){
                done(err);
            }
            if (user == null){
                done(null, false, {message: 'Invalid username'});
            }
            
        })
    }
));

module.exports = passport;
