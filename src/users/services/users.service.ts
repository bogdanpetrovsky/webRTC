const bcrypt = require('bcrypt');
import * as _ from "underscore"
import { User, UserInterface } from "../../core/models/User";


interface IUserCreateOptions {
  recaptchaToken: string;
  password: string;
  emailVerified: boolean;
}

class UsersService {
  public async userExists(id: number) {
    return User.findByPk(id).then(u => u !== null);
  }

  public async getById(id: number) {
    return User.findByPk(id);
  }

  public async getUserModelById(id: number, requestingUserId?: number) {
    const requestedUser = await User.findByPk(id);
    const requestingUser = await User.findByPk(requestingUserId);

    return requestedUser?.toModel();
  }

  public async getByEmail(email: string) {
    return User.findOne({
      where: {email},
    });
  }

  public async create(options: UserInterface) {
    if (!process.env.PASSWORD_SECRET || !options.password) {
      throw new Error('Secret not provided');
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(options.password, salt);

    const userObject: UserInterface = {
      email: options.email,
      password: hash,
    };

    if (options.firstName) { userObject.firstName = options.firstName; }
    if (options.lastName) { userObject.lastName = options.lastName; }
    if (options.imageUrl) { userObject.imageUrl = options.imageUrl; }

    return User.create(userObject as any);
  }

  public async update(id: number, options: UserInterface) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('No user with such id!');
    }
    const updateObject: UserInterface = {};
    if (options.hasOwnProperty('firstName')) {
      updateObject.firstName = options.firstName;
    }
    if (options.hasOwnProperty('lastName')) {
      updateObject.lastName = options.lastName;
    }
    if (options.hasOwnProperty('about')) {
      updateObject.about = options.about;
    }
    if (options.hasOwnProperty('imageUrl')) {
      updateObject.imageUrl = options.imageUrl;
    }
    if (options.hasOwnProperty('interests')) {
      updateObject.interests = options.interests;
    }

    if (options.hasOwnProperty('age')) {
      updateObject.age = options.age;
    }

    if (options.hasOwnProperty('gender')) {
      updateObject.gender = options.gender;
    }

    await user.update(updateObject);
    return user;
  }

  public async setPassword(userId: number, password: string) {
    if (!process.env.PASSWORD_SECRET) { throw new Error('Secret not provided'); }
    const encryptedPassword = await bcrypt.hash(password, process.env.PASSWORD_SECRET);
    const user = await User.findByPk(userId, {});

    await user.update({ password: encryptedPassword, isActivated: true });

    return user;
  }

  public async getAllUsers(limit: number, offset: number) {
    const usersFormatted: User[] = [];

    const users = await User.findAll({
      order: [['createdAt', 'DESC']],
      limit: limit || 10,
      offset: offset || 0
    });

    const total = await User.count();
    _.each(users, (elem) => usersFormatted.push(elem));

    return {
      data: usersFormatted,
      total,
      offset
    };
  }

  public async getByEmailAndPassword(email: string, password: string) {
    return User.findOne({
      where: {email, password},
    });
  }

}

export const usersService = new UsersService();

