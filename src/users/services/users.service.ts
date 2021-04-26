import * as bcrypt from 'bcryptjs';
import * as _ from "underscore"
import { User, UserInterface } from "../../core/models/User";


interface IUserCreateOptions {
  recaptchaToken: string;
  password: string;
  emailVerified: boolean;
}

export interface IPendingActionsCount {
  applications?: number;
  contactRequests?: number;
  teamInvitations?: number;
  total?: number;
}

class UsersService {
  public async userExists(id: number) {
    return User.findByPk(id).then(u => u !== null);
  }

  public async getById(id: number) {
    return User.scope('full').findByPk(id);
  }

  public async getUserModelById(id: number, requestingUserId?: number) {
    const requestedUser = await User.scope('full').findByPk(id);
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

    const hashedPassword = await bcrypt.hash(options.password, process.env.PASSWORD_SECRET);
    const userObject: UserInterface = {
      email: options.email,
      password: hashedPassword,
    };
    const includeObject: any = {};


    if (options.firstName) { userObject.firstName = options.firstName; }
    if (options.lastName) { userObject.lastName = options.lastName; }
    if (options.imageUrl) { userObject.imageUrl = options.imageUrl; }

    return User.create(_.extend(includeObject, userObject));
  }

  public async update(id: number, options: UserInterface) {
    const user = await User.scope('full').findByPk(id);
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

  // public async isAdmin(userId: Id) {
  //   const user = await User.findByPk(userId);
  //   if (!user) { return false; }
  //   return user.role.name === 'admin';
  // }
}

export const usersService = new UsersService();

