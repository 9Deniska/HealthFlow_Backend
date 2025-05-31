import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Specialization } from '../../specializations/entities/specialization.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  location: string;

  @OneToMany(
    () => Specialization,
    (specialization) => specialization.department,
  )
  specializations: Specialization[];

  @OneToMany(() => Doctor, (doctor) => doctor.department)
  doctors: Doctor[];
}
