const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');

const actionSchema = new mongoose.Schema({
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
  roles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      autopopulate: true
    }
  ]
}/*, {timestamps: true}*/);
actionSchema.plugin(autopopulate);

module.exports = mongoose.model('Action', actionSchema);
