const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');
const mongoose_fuzzy_searching = require('mongoose-fuzzy-searching');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  roles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      autopopulate: true
    }
  ]
});
userSchema.plugin(autopopulate);
userSchema.plugin(mongoose_fuzzy_searching, {fields: ['name', 'email']});

module.exports = mongoose.model('User', userSchema);
