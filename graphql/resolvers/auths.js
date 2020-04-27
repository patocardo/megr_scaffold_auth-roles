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
      console.log(token, decodedToken);
      return {
        email: decodedToken.email
      }
    } catch (e) {
      throw e;
    }
  },
  resolvers: async function(args, req) {
    /*
    if(!req.isAuth) throw new Error(ErrorMessages.notAuthenticated.response);
    const user = await User.findById(req.userData.userId);
    if(!user || !user.roles.some(role => role.name === 'sudo'))
      throw new Error(ErrorMessages.notAuthorized.response);
      */
    return Object.keys(this);
  },
  isAuthorized: async function(resolverName, req) {
    if(!req.isAuth) throw new Error(ErrorMessages.notAuthenticated.response);
    const user = await User.findById(req.userData.userId);
    if(!user) throw new Error(ErrorMessages.nonexistent('User').response);
    // TODO: change mapping to model search
    const userWith = await User.findById(req.userData.userId).populate({path: 'roles', populate: { path: 'resolvers'}});
    const rolesIn = user.populated('roles');
    const role = await Role.findById('5ea6be2222f5364536fcfaaa');
    // const resolvers = user.populated('resolvers');
    // const roles = await Role.find({ _id: { $in: Array.from(user.populated('roles')) }})/* .populate('resolvers') */;
    // const resolvers = roles.populated('resolvers');
/*     await user.populate('roles').execPopulate();

5ea6be2222f5364536fcfaaa

    const rolesWith = await Role.find({ resolvers: resolverName }); */
    console.log('userWith', userWith, 'roles', rolesIn, /*'resolvers', resolvers*/ 'role', role);
    

    // console.log('rolesWith', rolesWith, 'roles', roles, 'userWith', userWith);
/*     return roles.some(role => {
      return role.resolvers.includes(resolverName);
    }); */
    return true;
  }
}

  /*
  logout: async ({email}) => {
    // TODO: service to remove all tokens linked to an email
  }
  */

module.exports = actionResolvers;