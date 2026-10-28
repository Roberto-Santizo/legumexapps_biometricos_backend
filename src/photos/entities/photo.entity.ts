import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../auth/entities/user.entity.js";

@Entity()
@Index(['code', 'url'])
export class Photo {
    @PrimaryGeneratedColumn('uuid') id: string;

    @Column('text', { unique: true }) code: string;
    @Column('text') url: string;

    @CreateDateColumn() createdAt: Date;
    @UpdateDateColumn() updatedAt: Date;

    @ManyToOne(() => User, { eager: true }) created_by: User;
}