const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
import express ,{ Request, Response} from 'express';

import Event from '../../models/event';
import User, { IUserInput } from '../../models/user';

import { RequestWithAuth } from '../../helpers/global-interfaces';

const userResolvers = {
  users: (args: any, req: RequestWithAuth) => {
    try {
      if(!req.isAuth) throw new Error('not authenticated.');
      const users = User.find().select('-password');
      return users;
    } catch(err) {
      throw err;
    }
  },
  createUser: async (args: {userInput: IUserInput} , req: RequestWithAuth) => {
    try {
      if(!req.isAuth) throw new Error('not authenticated.');
      const existingUser = await User.findOne({email: args.userInput.email});
      if(existingUser) throw new Error('user already exists.');
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
      const user  = new User({
        email: args.userInput.email,
        password: args.userInput.password,
      });
      const result = await user.save();
      return {...result._doc, password: null};
    } catch(err) {
      throw err;
    }
  },
  login: async ({email, password}: IUserInput) => {
    const existingUser = await User.findOne({email: email});
    if(!existingUser) throw new Error('user does not exists');
    const hash = await bcrypt.hashSync(password, 12);
    const passMatch = await bcrypt.compare(existingUser.password, hash);
    if(!passMatch) throw new Error('incorrect password');
    const token = jwt.sign(
      {userId: existingUser.id, email: existingUser.email},
      'secretkey',
      {expiresIn: '1h'}
    );
    return {
      userId: existingUser.id,
      token: token,
      expiration: 1
    }
  }
}

module.exports = userResolvers;