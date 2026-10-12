import { ApiProperty } from "@nestjs/swagger";
import { AuthUserInterface } from "../interfaces/interfaces.js";

export class AuthUserResponse implements AuthUserInterface {
    @ApiProperty({
        description: 'Identificador único del usuario',
        format: 'uuid',
        example: '3f2b8c1e-9a4d-4e7b-8c21-5d6f7a8b9c0d',
    })
    id: string;

    @ApiProperty({
        description: 'Nombre completo del usuario',
        example: 'Juan Pérez López',
    })
    name: string;

    @ApiProperty({
        description: 'Correo electrónico del usuario',
        format: 'email',
        example: 'juan.perez@legumex.com',
    })
    email: string;

    @ApiProperty({
        description: 'Roles asignados al usuario',
        type: [String],
        example: ['user'],
    })
    roles: string[];

    @ApiProperty({
        description: 'Token JWT para autenticar las siguientes peticiones (Bearer)',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjNmMmI4YzFlIn0.abc123',
    })
    token: string;
}
