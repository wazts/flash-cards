// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var cardSchema = new Schema({
  type: String,
  front: {
      html: String,
      media: [String]
  },
  back: {
      html: String,
      media: [String]
  },
  descrption: {
      html: String,
      media: [String]
  },
  reliesOn: [Schema.Types.ObjectId],
},
  {
    timestamps: true
  });

// the schema is useless so far
// we need to create a model using it
var Card = mongoose.model('Card', cardSchema);

module.exports = Card;
