import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {

    @ApiProperty({
        description: 'Identificador único del usuario',
        format: 'uuid',
        example: '3f2b8c1e-9a4d-4e7b-8c21-5d6f7a8b9c0d',
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        description: 'Nombre completo del usuario',
        example: 'Juan Pérez López',
    })
    @Column('text')
    name: string;

    @ApiProperty({
        description: 'Correo electrónico único del usuario',
        format: 'email',
        example: 'juan.perez@legumex.com',
    })
    @Column('text', {
        unique: true
    })
    email: string;

    @Column('text')
    password: string;

    @ApiProperty({
        description: 'Indica si el usuario está activo',
        example: true,
    })
    @Column('boolean',
        { default: true }
    )
    isActive: boolean;

    @ApiProperty({
        description: 'Roles asignados al usuario',
        type: [String],
        example: ['user'],
    })
    @Column('text',
        { array: true, default: ['user'] }
    )
    roles: string[];
}