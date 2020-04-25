const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Role = require('../../models/role');
const User = require('../../models/user');
const ErrorMessages = require('../../helpers/error-messages');

const userResolvers = {
  users: (args, req) => {
    try {
      // if(!req.isAuth) throw new Error(ErrorMessages.notAuthenticated.response);
      let users = [];
      console.log(!!args.search, !!args.role);
      if (!!args.search) {
        users = (!!args.role)
          ? User.fuzzySearch(args.search, { roles: { $elemMatch: { $eq: args.role } } }).select('-password')
          : User.fuzzySearch(args.search);
      } else {
        users = (!!args.role)
        ? User.find({ roles: { $elemMatch: { $eq: args.role } } }).select('-password')
        : User.find().select('-password');
      }


      // TODO: pagination
      return users;
    } catch(err) {
      throw err;
    }
  },
  createUser: async (args, req) => {
    try {
      // if(!req.isAuth) throw new Error(ErrorMessages.notAuthenticated.response);
      const existingUser = await User.findOne({email: args.userInput.email});
      if(existingUser) throw new Error(ErrorMessages.duplicate('User').response);
      const hash = await bcrypt.hash(args.userInput.password, 10);
      const roles = await Role.find({'_id':{
        $in: args.userInput.roles.map(role => mongoose.Types.ObjectId(role))
      }});
      if (roles.length != args.userInput.roles.length) throw new Error(ErrorMessages.inconsistency.response);
      const user  = new User({
        name: args.userInput.name,
        email: args.userInput.email,
        password: hash,
        roles
      });
      const result = await user.save();
      return {...result._doc, password: null};
    } catch(err) {
      throw err;
    }
  },
  updateUser: async (args, req) => {
    try {
      // if(!req.isAuth) throw new Error(ErrorMessages.notAuthenticated.response);
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
      const result = await existingUser.update(newData);
      return {...existingUser._doc, password: null};
    } catch (err) {
      throw err;
    }

  },
  login: async ({email, password, remember}) => {
    const existingUser = await User.findOne({email: email});
    if(!existingUser) throw new Error('user does not exists');
    const passMatch = await bcrypt.compare(password, existingUser.password);
    if(!passMatch) throw new Error('incorrect password');
    const token = jwt.sign(
      {userId: existingUser.id, email: existingUser.email, remember},
      process.env.JWT_SECRET,
      {expiresIn: remember ? '7d' : '1h'}
    );
    return {
      token: token,
      expiration: 1
    }
  },
  tokenIsAlive: ({token}) => {
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      console.log(token, decodedToken);
      return {
        email: decodedToken.email
      }
    } catch (e) {
      throw e;
    }
  },
  /*
  logout: async ({email}) => {
    // TODO: service to remove all tokens linked to an email
  }
  */
}

module.exports = userResolvers;