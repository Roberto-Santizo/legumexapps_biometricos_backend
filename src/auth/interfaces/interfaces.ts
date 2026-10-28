export interface AuthUserInterface {
    id: string;
    name: string;
    email: string;
    roles: string[];
    token: string;
}

export interface UserInterface {
    id: string;
    name: string;
    email: string;
    roles: string[];
    isActive: boolean;
}

export interface JwtPayload {
    id: string;
}

export enum ValidRoles {
    admin = 'admin',
    rrhh = 'rrhh',
    fincas = 'fincas',
    user = 'user',
}