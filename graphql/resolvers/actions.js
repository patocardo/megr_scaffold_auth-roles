const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Role = require('../../models/role');
const Action = require('../../models/action');
const ErrorMessages = require('../../helpers/error-messages');

const actionResolvers = {
  actions: (args, req) => {
    try {
      // if(!req.isAuth) throw new Error(ErrorMessages.notAuthenticated.response);
      let actions = [];
      if(!!args.search) {
        actions = Action.find().select('-password');
      } else {
        const criteria = {};
        if (args.search && args.search.length) {
          criteria.name = new RegExp(args.search, 'i');
        }
        actions = Action.find(criteria).select('-password');
      }
      return actions;
    } catch(err) {
      throw err;
    }
  },
  createAction: async (args, req) => {
    try {
      // if(!req.isAuth) throw new Error(ErrorMessages.notAuthenticated.response);
      const existingAction = await Action.findOne({name: args.actionInput.name});
      if(existingAction) throw new Error(ErrorMessages.duplicate('Action').response);

      const roles = await Role.find({'_id':{
        $in: args.actionInput.roles.map(role => mongoose.Types.ObjectId(role))
      }});
      if (roles.length != args.actionInput.roles.length) throw new Error(ErrorMessages.inconsistency.response);
      const action  = new Action(args.actionInput);
      const result = await action.save();
      return result._doc;
    } catch(err) {
      throw err;
    }
  },
  updateAction: async (args, req) => {
    try {
      if(!req.isAuth) throw new Error(ErrorMessages.notAuthenticated.response);
      const existingAction = await Action.findById(args.id);
      if(!existingAction) throw new Error(ErrorMessages.nonexistent('Action').response);
      const newData = {...args.actionInput};
      newData.roles = await Role.find({'_id':{
        $in: args.actionInput.roles.map(role => mongoose.Types.ObjectId(role))
      }});
      if (newData.roles.length != args.actionInput.roles.length) throw new Error(ErrorMessages.inconsistency.response);
      const result = await existingAction.update(newData);
      return existingAction._doc;
    } catch (err) {
      throw err;
    }

  }
}

module.exports = actionResolvers;