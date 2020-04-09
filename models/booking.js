const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');

const bookingSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    autopopulate: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: { select: '-password'}
  },
}, {timestamps: true});
bookingSchema.plugin(autopopulate);

module.exports = mongoose.model('Booking', bookingSchema);
