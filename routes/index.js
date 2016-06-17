var express = require('express');
var router = express.Router();
var passport = require('../lib/passport');
var validator = require('validator');
var logger = require('../lib/logger');

var SetupInfo = require('../models/siteInfo');
var User = require('../models/user');
var PasswordHash = require('../lib/password');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('home', {
        title: 'Express'
    });
});

/* GET Setup */
router.get('/setup', function(req, res, next) {
    SetupInfo.findOne({}, function(err, site) {
        if (err) {
            res.status(500);
        }

        if (site) {
            res.redirect('/');
        }

        res.render('setup');
    });
});

/* GET Setup */
router.post('/setup', function(req, res, next) {
    if (!req.body) {
        return res.redirect('/setup')
    }
    SetupInfo.findOne({}, function(err, site) {
        if (err) {
            res.status(500);
        }

        if (site) {
            res.redirect('/');
        }

        var username = req.body.username;
        var email = req.body.email;
        var password = req.body.password;
        var passwordMatch = req.body.passwordMatch;

        var valid = true;

        // Email
        if (!(validator.isEmail(email))) {
            req.flash('error_messages', 'Invalid Email');
            valid = valid && false;
        }

        // Username
        username = validator.trim(username);
        if (username.indexOf(' ') >= 0) {
            req.flash('error_messages', 'No whitespace allowed in username');
            valid = valid && false;
        }


        // Check passwords
        if (!password) {
            req.flash('error_messages', 'Please provide password');
            valid = valid && false;
        }
        if (password != passwordMatch) {
            req.flash('error_messages', 'Passwords don\'t match');
            valid = valid && false;
        }

        // Username 
        if (!username) {
            req.flash('error_messages', 'Please provide username');
            valid = valid && false;
        }
        User.count({
            username_lower: username
        }, function(err, count) {
            if (err || count > 0) {
                req.flash('error_messages', 'Username already exists');
                valid = valid && false;
            }
            if (!valid) {
                return res.redirect('/setup');
            }

            PasswordHash.createHash(password, function(err, hash) {
                // Create the user
                if (err) {
                    return res.status(500);
                }
                var user = new User({
                    username: username,
                    username_lower: username.toLowerCase(),
                    email: email,
                    hash: hash,
                    admin: true
                });

                user.save(function(err) {
                    if (err) {
                        logger.error(err);
                        return res.status(500).json({error: 'User error'});
                    }
                    else {
                        logger.info('Created user - user: ' + username + ' email: ' + email);
                        req.flash('success_messages', 'New site is set up');
                        return res.redirect('/')
                    }
                });
            });
        });
    });
});

router.get('/login', function(req, res, next) {
    if (req.user) {
        res.redirect('/');
    }
    else {
        res.render('login', {
            title: 'Login'
        });
    }
});

router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })
);

module.exports = router;
