import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Discount {
    @PrimaryGeneratedColumn('uuid') id: string;
    
    @Column() code: string;
    @Column('float') amount: number;
    @Column('date') date: Date;
    @CreateDateColumn() createdAt: string;
    @UpdateDateColumn() updatedAt: string;
}
