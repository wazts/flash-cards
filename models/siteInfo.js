// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var siteInfoSchema = new Schema({
    isSetup: {
        type: Boolean,
        required: true
    },
    adminEmail: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// the schema is useless so far
// we need to create a model using it
var SetupInfo = mongoose.model('SetupInfo', siteInfoSchema);

// make this available to our SetupInfos in our Node applications
module.exports = SetupInfo;
