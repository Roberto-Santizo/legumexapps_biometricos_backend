import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Discount {
    @ApiProperty({ description: 'Identificador único del descuento', format: 'uuid', example: '3f1c2a9e-8b7d-4e6f-9a12-5c4b3d2e1f00' })
    @PrimaryGeneratedColumn('uuid') id: string;

    @ApiProperty({ description: 'Código (pin) del empleado', example: '1001' })
    @Column() code: string;

    @ApiProperty({ description: 'Monto del descuento', type: Number, example: 25.5 })
    @Column('float') amount: number;

    @ApiProperty({ description: 'Fecha del descuento', type: String, format: 'date', example: '2026-11-12' })
    @Column('date') date: Date;

    @ApiProperty({ description: 'Fecha de creación del registro', format: 'date-time', example: '2026-11-12T14:30:00.000Z' })
    @CreateDateColumn() createdAt: string;

    @ApiProperty({ description: 'Fecha de última actualización del registro', format: 'date-time', example: '2026-11-12T14:30:00.000Z' })
    @UpdateDateColumn() updatedAt: string;
}
