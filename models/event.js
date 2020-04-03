const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate')

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: { select: '-password'}
  }
});
eventSchema.plugin(autopopulate);

module.exports = mongoose.model('Event', eventSchema);