export interface JwtPayloadInterface {
    jti: string;
    id: number;
    iat: string;
    iss: string,
    role: string
}
