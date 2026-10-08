import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @ApiProperty({ description: 'Identificador único del usuario', example: 1 })
    @PrimaryGeneratedColumn('increment')
    id: number;

    @ApiProperty({ description: 'Nombre completo del usuario', example: 'Juan Pérez' })
    @Column('text')
    name: string;

    @ApiProperty({ description: 'Correo electrónico único del usuario', format: 'email', example: 'juan.perez@legumex.com' })
    @Column('text', {
        unique: true
    })
    email: string;

    @Column('text')
    password: string;

    @ApiProperty({ description: 'Fecha de creación del usuario', example: '2026-10-08T15:30:00.000Z' })
    @CreateDateColumn()
    createdAt: Date;
}
