import { ApiProperty } from "@nestjs/swagger";
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Role {
    @ApiProperty({ description: 'ID del rol', example: 1 })
    @PrimaryGeneratedColumn('increment')
    id: number;

    @ApiProperty({ description: 'Nombre del rol en minúsculas', example: 'administrador' })
    @Column('text', {
        unique: true
    })
    name: string;

    @ApiProperty({ description: 'Fecha de creación', example: '2026-01-15T10:30:00.000Z' })
    @CreateDateColumn()
    createdAt: Date;


    @BeforeInsert()
    insertTransformNameToLowerCase(){
        console.log(this.name);
        this.name = this.name.toLowerCase();
    }

    @BeforeUpdate()
    updateTransformNameToLowerCase(){
        this.name = this.name.toLowerCase();
    }
    
    
}
