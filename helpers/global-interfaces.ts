import { Request } from 'express';

export interface IdInterface {
  id: string;
}

export interface RequestWithAuth extends Request {
  isAuth?: boolean;
  userId?: string;
}