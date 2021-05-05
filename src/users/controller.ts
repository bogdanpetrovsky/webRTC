import * as express from 'express';
import { validationResult } from 'express-validator';
import { usersService } from './services/users.service';
import { UserInterface } from '../core/models/User';

class UsersController {
  public async update(req: express.Request, res: express.Response, next: express.NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    const updateObject: UserInterface = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      about: req.body.about,
      imageUrl: req.body.imageUrl,
      interests: req.body.interests
    };

    if (req.body.hasOwnProperty('firstName')) {
      updateObject.firstName = req.body.firstName ? req.body.firstName : null;
    }

    if (req.body.hasOwnProperty('lastName')) {
      updateObject.lastName = req.body.lastName ? req.body.lastName : null;
    }

    if (req.body.hasOwnProperty('about')) {
      updateObject.about = req.body.about ? req.body.about : null;
    }

    if (req.body.hasOwnProperty('imageUrl')) {
      updateObject.imageUrl = req.body.imageUrl ? req.body.imageUrl : null;
    }

    if (req.body.hasOwnProperty('age')) {
      updateObject.age = req.body.age ? req.body.age : null;
    }

    if (req.body.hasOwnProperty('gender')) {
      updateObject.gender = req.body.gender ? req.body.gender : null;
    }

    if (req.body.hasOwnProperty('interests')) {
      updateObject.interests = req.body.interests ? req.body.interests : null;
    }

    try {
      const user = await usersService.update(parseInt(req.params.id,10), updateObject);
      res.status(200).json(user.toModel());
    } catch (e) {
      res.status(500).json({ error: true, message: 'ERROR' });
    }
  }

  public async getById(req: express.Request, res: express.Response, next: express.NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(404).json({errors: errors.array()});
    }

    try {
      const user = await usersService.getUserModelById(parseInt(req.params.id,10), req.user.id);
      if (!user) {
        return res.status(404).json({ error: true, code: 404 })
      }
      res.status(200).json(user);
    } catch (e) {
      res.status(500).json({ error: true, message: 'ERROR' });
    }
  }

  public async getAllUsers(req: express.Request, res: express.Response) {
    const limit = req.query.limit ? +req.query.limit : 10;
    const offset = req.query.offset ? +req.query.offset : 0;

    try {
      const users = await usersService.getAllUsers(limit, offset);
      res.status(200).json(users);
    } catch (e) {
      res.status(500).json({ errors: Error });
    }
  }

  public async search(req: express.Request, res: express.Response, next: express.NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    if (!req.query.query) {
      throw new Error('query param is required!')
    }

    try {
      const query = req.query.query.toString().toLocaleLowerCase();
      const interests = [
        { name: 'computers'},
        { name: 'sports'},
        { name: 'dates'},
        { name: 'films'},
        { name: 'education'},
        { name: 'books'},
        { name: 'politics'},
        { name: 'science'},
      ];
      const result = interests.filter((interest) =>  interest.name.startsWith(query));
      console.log(result);
      res.status(200).json(result);
    } catch (e) {
      res.status(500).json({ error: true });
    }
  }
}

export const usersController = new UsersController();
