export type UserRole = 'user' | 'company';

export interface SignUpInterface {
    email: string;
    password: string;
}

export interface SignInInterface {
    email: string;
    password: string;
}
