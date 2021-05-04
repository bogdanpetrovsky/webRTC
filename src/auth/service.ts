import {
    SignInInterface,
    SignUpInterface,
} from './models/auth.models';
import { User } from '../core/models/User';
const bcrypt = require('bcrypt');
import * as jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { usersService } from '../users/services/users.service';

class AuthService {

    public async signUp(options: SignUpInterface) {
        const existingUser = await usersService.getByEmail(options.email);
        if (existingUser) {
            throw new Error('User with such email already exists');
        }

        return usersService.create(options);
    }

    public async signIn(options: SignInInterface) {
        if (!process.env.PASSWORD_SECRET) {
            throw new Error('Secret not provided');
        }

        const saltRounds = '$2b$10$fCkXd.WNJN9C2wbZ/9TMpO';

        return bcrypt.hash(options.password, saltRounds, function(err, hash) {
            bcrypt.compare(options.password, hash, function(err, result) {
                if (result) {
                    User.findOne({ where: { email: options.email }}).then((user: User) => {
                        if (!user) { throw new Error('User with such credentials does not exist!'); }

                        const jti = uuid();
                        if (!process.env.JWT_SECRET) { throw new Error('Secret not provided') }
                        console.log(user.toModel());
                        return {
                            token: jwt.sign({ jti, id: user.id, iat: Date.now(), iss: user.email },
                                process.env.JWT_SECRET,
                                {expiresIn: '30d'}
                            ),
                            user: user.toModel()
                        };
                    });
                }
                // if passwords do not match
                else {
                    console.log("Invalid password!");
                }
            });
        });
    }
}

export const authService = new AuthService();
