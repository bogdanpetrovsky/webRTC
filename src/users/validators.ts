import * as express from 'express';

import { check, param } from 'express-validator';
import { User } from "../core/models/User";


const updateValidator = [
  check('firstName').optional().isLength({ min: 2, max: 40 }),
  check('lastName').optional().isLength({ min: 2, max: 40 }),
  check('about').optional().isLength({ min: 1, max: 20000 }),
  param('id').custom(checkIfUserExists),
  isAccountOwner
];

const getValidator = [
  param('id').custom(checkIfUserExists)
];

const getUsersValidator = [];

export const usersValidators = {
  updateValidator, getValidator, getUsersValidator,
};

function isAccountOwner(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!req.user || req.user.id !== req.params.id) {
    res.status(403).send();
  } else {
    next();
  }
}

async function checkIfUserExists(userId: string) {
  const user = await User.findByPk(userId);
  if (!user) {
    return Promise.reject();
  }
}


