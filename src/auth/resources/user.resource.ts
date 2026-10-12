import { User } from "../entities/user.entity.js";
import { AuthUserInterface, UserInterface } from "../interfaces/interfaces.js";

export class UserResource {
    static authUser(user: User, token: string): AuthUserInterface {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            roles: user.roles,
            token: token
        };
    }

    static userCollection(users: User[]): UserInterface[] {
        const FormmatedUsers = users.map(user => this.user(user))
        return FormmatedUsers;
    }

    static user(user: User): UserInterface {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            isActive: user.isActive,
            roles: user.roles
        };
    }
}