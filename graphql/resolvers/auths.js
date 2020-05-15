const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/user');
const ErrorMessages = require('../../helpers/error-messages');

const actionResolvers = {
  login: async ({email, password, remember}) => {
    const existingUser = await User.findOne({email: email});
    if(!existingUser) throw new Error('user does not exists');
    const passMatch = await bcrypt.compare(password, existingUser.password);
    if(!passMatch) throw new Error('incorrect password');
    const expiresIn = remember ? '7d' : 60;
    const token = jwt.sign(
      {userId: existingUser.id, email: existingUser.email, remember},
      process.env.JWT_SECRET,
      {expiresIn}
    );
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    return { userId: existingUser.id, token, expiration: decodedToken.exp * 1000};
  },
  tokenIsAlive: function({token}) {
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      return {...decodedToken, expiration: decodedToken.exp * 1000};
    } catch (e) {
      throw e;
    }
  },
  refreshToken: async function(args, req) {
    if(!this.isAuthorized('refreshToken', req)) throw new Error(ErrorMessages.notAuthorized.response);
    const expiresIn = req.userData.remember ? '7d' : '60s';
    const token = jwt.sign(
      {...req.userId},
      process.env.JWT_SECRET,
      {expiresIn}
    );
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    return { userId: req.userData.id, token, expiration: decodedToken.exp * 1000};
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