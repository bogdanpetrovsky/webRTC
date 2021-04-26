import { check, param } from 'express-validator';

const passwordValidator = check('password')
    .matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^a-zA-Z0-9]).{8,}$/);
const signUpValidator = [
    check('email').isEmail(),
    passwordValidator
];
const signInValidator = [check('email').isEmail()];

export const authValidators = {
    signUpValidator,
    signInValidator,
};
