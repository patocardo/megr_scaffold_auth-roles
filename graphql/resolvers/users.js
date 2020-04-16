const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Event = require('../../models/event');
const User = require('../../models/user');

const userResolvers = {
  users: (args, req) => {
    try {
      if(!req.isAuth) throw new Error('not authenticated.');
      const users = User.find().select('-password');
      return users;
    } catch(err) {
      throw err;
    }
  },
  createUser: async (args , req) => {
    try {
      if(!req.isAuth) throw new Error('not authenticated.');
      const existingUser = await User.findOne({email: args.userInput.email});
      if(existingUser) throw new Error('user already exists.');
      const hash = await bcrypt.hash(args.userInput.password, 10);
      const user  = new User({
        email: args.userInput.email,
        password: hash,
      });
      const result = await user.save();
      return {...result._doc, password: null};
    } catch(err) {
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