import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../auth/entities/user.entity.js";

@Entity()
@Index(['code', 'url'])
export class Photo {
    @ApiProperty({
        description: 'Identificador único de la foto',
        format: 'uuid',
        example: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    })
    @PrimaryGeneratedColumn('uuid') id: string;

    @ApiProperty({ description: 'Código único de la foto (normalmente el PIN del empleado)', example: '10045' })
    @Column('text', { unique: true }) code: string;

    @ApiProperty({ description: 'Nombre del archivo en el almacenamiento', example: '10045.jpg' })
    @Column('text') url: string;

    @ApiProperty({ description: 'Fecha de creación', example: '2026-10-28T14:30:00.000Z' })
    @CreateDateColumn() createdAt: Date;

    @ApiProperty({ description: 'Fecha de última actualización', example: '2026-10-28T14:30:00.000Z' })
    @UpdateDateColumn() updatedAt: Date;

    @ApiProperty({ description: 'Usuario que registró la foto', type: () => User })
    @ManyToOne(() => User, { eager: true }) created_by: User;
}