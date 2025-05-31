import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('specializations')
export class Specialization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column()
  department_id: number;
}
