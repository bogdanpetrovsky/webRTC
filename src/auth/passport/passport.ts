import passport from "passport";
import { usersService } from '../../users/services/users.service';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';


import { JwtPayloadInterface } from '../models/jwt';
import { User } from "../../core/models/User";



export function initPassportConfiguration() {
    if (!process.env.JWT_SECRET) {
      throw new Error('Env variables not provided');
    }

    const jwtStrategyOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
    };
    const localStrategyOptions = {
        usernameField: 'email',
        passwordField: 'password',
        session: false
    };

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user as User);
    });

    passport.use(new LocalStrategy(localStrategyOptions, localVerifyFunction));
    passport.use(new JWTStrategy(jwtStrategyOptions, jwtVerifyFunction));
}

async function jwtVerifyFunction(payload: JwtPayloadInterface, done: any) {
    await usersService.getById(payload.id)
        .then((user) => {
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        })
        .catch((err) => {
            return done(err, false);
        });
}

async function localVerifyFunction(email: string, password: string, done: any) {
    usersService.getByEmailAndPassword(email, password)
        .then((user) => {
            if (user) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'User does not exist' });
            }
        })
        .catch((err) => {
            done(err);
        });
}
