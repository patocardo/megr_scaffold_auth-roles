const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');
const mongoose_fuzzy_searching = require('mongoose-fuzzy-searching');

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
roleSchema.plugin(mongoose_fuzzy_searching, {fields: ['name', 'description']});

module.exports = mongoose.model('Role', roleSchema);
