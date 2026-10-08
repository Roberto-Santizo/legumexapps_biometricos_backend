import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Role {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column('text', {
        unique: true
    })
    name: string;

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
