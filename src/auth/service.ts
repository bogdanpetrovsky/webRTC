import {
    SignInInterface,
    SignUpInterface,
} from './models/auth.models';
import { User } from '../core/models/User';
import * as bcrypt from 'bcryptjs';
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
        const encryptedPassword = await bcrypt.hash(options.password, process.env.PASSWORD_SECRET);

        const user = await User.findOne({ where: { email: options.email, password: encryptedPassword }});

        if (!user) { throw new Error('User with such credentials does not exist!'); }

        return {
            token: this.generateToken(user),
            user: user.toModel()
        };
    }

    private generateToken(user: User) {
        const jti = uuid();
        if (!process.env.JWT_SECRET) {
            throw new Error('Secret not provided')
        }

        return jwt.sign(
            {jti, id: user.id, iat: Date.now(), iss: user.email },
            process.env.JWT_SECRET,
            {expiresIn: '30d'}
        )
    }
}

export const authService = new AuthService();
