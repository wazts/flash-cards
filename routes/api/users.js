var express = require('express');
var router = express.Router();
var PasswordHash = require('../../lib/password.js');


var User = require('../../models/user');


/* GET users listing. */
router.get('/', function(req, res, next) {
    User.find({}, function(err, users){
        
        if(err){
            res.status(500);
        }
        var userMap = {};
        
        users.forEach(function(user) {
            userMap[user._id] = user;
        });
        res.json(userMap);
    });
});

// Create a new user
router.post('/', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.password;
    
    // Check if email or password is used already
    User.findOne({username_lower: username.toLowerCase()}, function(err, user){
        console.log('hello');
        if(err){
            res.status(500).json({error: err});
        }
        if (user){
            res.status(400).json({error: 'Username already taken'});
        }
    });
    
    var userEmail = User.find({email: email});
    
    if (userEmail) {
        res.status(400).json({error: 'Email already in use'});
    }
    
    if (username && password && email) {
        PasswordHash.createHash(password, function(err, hash){
            if (err){
                res.status(500).json({error: 'Hashing Error'});
            }
        });
    } else {
        res.status(400).json({error: 'Creationg failed. Missing data.'});
    }
});

module.exports = router;
