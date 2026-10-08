import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column('text')
    name: string;

    @Column('text', {
        unique: true
    })
    email: string;

    @Column('text')
    password: string;

    @CreateDateColumn()
    createdAt: Date;
}
