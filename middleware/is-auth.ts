import { Request, Response, NextFunction  } from "express";
const jwt = require('jsonwebtoken');
import { RequestWithAuth } from '../helpers/global-interfaces';

export default function isAuth(req: RequestWithAuth, res: Response, next: NextFunction ) {
  const authHeader = req.get('Authorization');
  req.isAuth = false;
  if(!authHeader) return next();
  const token = authHeader.split(' ')[1];
  if(!token || token === '') return next();
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, 'secretkey');
  } catch(err) {
    return next();
  }
  if(!decodedToken) return next();
  req.isAuth = true;
  req.userId = decodedToken.userId;
  next();
}