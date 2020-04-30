const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Role = require('../../models/role');
const User = require('../../models/user');
const ErrorMessages = require('../../helpers/error-messages');

const actionResolvers = {
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
  tokenIsAlive: function({token}) {
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
       return {
        email: decodedToken.email
      }
    } catch (e) {
      throw e;
    }
  },
  resolvers: async function(args, req) {
    if(!this.isAuthorized('resolvers', req, 'sudo')) throw new Error(ErrorMessages.notAuthorized.response);
    return Object.keys(this);
  },
  isAuthorized: async function(resolverName, req, only) {
    if(!req.isAuth) throw new Error(ErrorMessages.notAuthenticated.response);
    const user = await User.findById(req.userData.userId);
    if(!user) throw new Error(ErrorMessages.nonexistent('User').response);
    // TODO: change mapping to model search
    if(only) {
      return user.roles.some(role => role.name === only)
    }
    return user.roles.some(role => {
      return role.resolvers.includes(resolverName);
    });
  }
}

  /*
  logout: async ({email}) => {
    // TODO: service to remove all tokens linked to an email
  }
  */

module.exports = actionResolvers;