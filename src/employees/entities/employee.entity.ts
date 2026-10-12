import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('pers_person')
export class Employee {
  @PrimaryColumn({
    type: 'varchar',
    length: 32,
  })
  id: string;

  @Column()
  name: string;

  @Column()
  last_name: string;

  @Column()
  pin: string;

  @Column()
  photo_path: string;
}
