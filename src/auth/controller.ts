import * as express from 'express';
import { validationResult } from "express-validator";
import { authService } from "./service";

class AuthController {
    public async signUp(req: express.Request, res: express.Response, next: express.NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        try {
            const user = await authService.signUp({
                email: req.body.email,
                password: req.body.password,
                recaptchaToken: req.body.recaptchaToken
            });

            res.status(200).json(user);
        } catch (e) {
            if (e.name && e.name === 'user_exists') {
                return res.status(401).json({
                    error: true,
                    message: 'Sorry, but user with such email already exists.',
                    code: e.name
                });
            }

            res.status(500).json({
                error: true,
                message: 'Something went wrong'
            });
        }
    }

    public async signIn(req: express.Request, res: express.Response, next: express.NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        try {
            const credentials = await authService.signIn({
                email: req.body.email,
                password: req.body.password
            });
            res.status(200).json(credentials);
        } catch (e) {
            res.status(401).json({error: true, message: e.message});
        }
    }
}

export const authController = new AuthController();
