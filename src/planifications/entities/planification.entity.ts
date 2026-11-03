import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Task } from "../../tasks/entities/task.entity.js";
import { User } from "../../auth/entities/user.entity.js";

@Entity()
@Index(['year', 'week'], { unique: true })
export class Planification {
    @ApiProperty({ description: 'ID de la planificación (UUID)', format: 'uuid', example: '3f2b8c1e-6d4a-4b9e-9c1a-2e7f5d8a9b10' })
    @PrimaryGeneratedColumn('uuid') id: string;

    @ApiProperty({ description: 'Año ISO de la semana', example: 2026 })
    @Column('int') year: number;

    @ApiProperty({ description: 'Semana ISO (1–53)', example: 45 })
    @Column('int') week: number;

    @ApiProperty({ description: 'Lunes de la semana', type: String, format: 'date', example: '2026-11-02' })
    @Column('date') start_date: Date;

    @ApiProperty({ description: 'Domingo de la semana', type: String, format: 'date', example: '2026-11-08' })
    @Column('date') end_date: Date;

    @OneToMany(() => Task, task => task.planification) tasks: Task[];

    @ManyToOne(() => User, { eager: true }) created_by: User;

    @ApiProperty({ description: 'Fecha de creación del registro', type: String, format: 'date-time', example: '2026-10-30T16:30:00.000Z' })
    @CreateDateColumn() created_at: Date;

    @ApiProperty({ description: 'Fecha de última actualización del registro', type: String, format: 'date-time', example: '2026-10-30T16:30:00.000Z' })
    @UpdateDateColumn() updated_at: Date;
}
