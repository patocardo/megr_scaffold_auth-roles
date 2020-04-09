const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  createdEvents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      autopopulate: true
    }
  ]
});
userSchema.plugin(autopopulate);

module.exports = mongoose.model('User', userSchema);
