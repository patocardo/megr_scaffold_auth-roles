const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const Role = require('../../models/role');
const User = require('../../models/user');
const ErrorMessages = require('../../helpers/error-messages');

const userResolvers = {
  users: async function (args, req) {
    try {
      if(!this.isAuthorized('users', req)) throw new Error(ErrorMessages.notAuthorized.response);

      let users = [];
      if (!!args.search) {
        users = (!!args.role)
          ? User.fuzzySearch(args.search, { roles: { $elemMatch: { $eq: args.role } } }).select('-password')
          : User.fuzzySearch(args.search);
      } else {
        users = (!!args.role)
          ? User.find({ roles: { $elemMatch: { $eq: args.role } } }).select('-password')
          : User.find().select('-password');
      }

      return users;
    } catch(err) {
      throw err;
    }
  },
  userById: async function(args, req) {
    try {
      if(!this.isAuthorized('userById', req)) throw new Error(ErrorMessages.notAuthorized.response);

      return User.findById(args.id);
    } catch(err) {
      throw err;
    }
  },
  userCreate: async function(args, req) {
    try {
      if(!this.isAuthorized('userCreate', req)) throw new Error(ErrorMessages.notAuthorized.response);

      const existingUser = await User.findOne({email: args.userInput.email});
      if(existingUser) throw new Error(ErrorMessages.duplicate('User').response);
      const hash = await bcrypt.hash(args.userInput.password, 10);
      const roles = await Role.find({'_id':{
        $in: args.userInput.roles.map(role => mongoose.Types.ObjectId(role))
      }});
      if (roles.length != args.userInput.roles.length) throw new Error(ErrorMessages.inconsistency.response);
      const user  = new User({...args.userInput, password: hash});
      const result = await user.save();
      return {...result._doc, password: null};
    } catch(err) {
      throw err;
    }
  },
  userUpdate: async function(args, req) {
    try {
      if(!this.isAuthorized('userUpdate', req)) throw new Error(ErrorMessages.notAuthorized.response);
      const existingUser = await User.findById(args.id);
      if(!existingUser) throw new Error(ErrorMessages.nonexistent('User').response);
      const newData = {...args.userInput};
      newData.roles = await Role.find({'_id':{
        $in: args.userInput.roles.map(role => mongoose.Types.ObjectId(role))
      }});
      if (newData.roles.length != args.userInput.roles.length) throw new Error(ErrorMessages.inconsistency.response);
      newData.hash = (args.userInput.password && args.userInput.password.length > 4)
        ? await bcrypt.hash(args.userInput.password, 10)
        : existingUser.password;
      Object.assign(existingUser, newData);
      const updatedUser = await existingUser.save();
      return {...updatedUser._doc, password: null};
    } catch (err) {
      throw err;
    }
  },
  usersRemove: async function(args, req) {
    try {
      if(!this.isAuthorized('usersDelete', req)) throw new Error(ErrorMessages.notAuthorized.response);
      const removedUsers = await User.deleteMany({'_id': { $in: args.ids }});
      if (removedUsers.ok !== 1) throw new Error(ErrorMessages.failed('remove users').response);
      return removedUsers.deletedCount; 
    } catch (err) {
      throw err;
    }
  }
}

module.exports = userResolvers;