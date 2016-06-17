// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var logger = require('../lib/logger');

// create a schema
var userSchema = new Schema({
    name: {
        first: String,
        last: String
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    username_lower: {
        type: String,
        required: true,
        unique: true
    },
    hash: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    admin: {
        type: Boolean,
        default: false
    },
    meta: {
        birthday: Date,
        website: String,
        location: String,
        twitterName: String
    }
}, {
    timestamps: true
});

// on every save, add the date
userSchema.pre('save', function(next) {
    logger.info('Saving user ' + this.username);
    if (!this.username_lower) {
        this.username_lower = this.username.toLowerCase();
        logger.info('Saving lower name');
    }
    next();
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
