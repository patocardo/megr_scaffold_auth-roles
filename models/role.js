const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  resolvers: {
    type: [String],
    required: true
  }
});
roleSchema.plugin(autopopulate);

module.exports = mongoose.model('Role', roleSchema);
