import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Department } from '../../departments/entities/department.entity';

@Entity('specializations')
export class Specialization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string; // Name of the specialization, e.g., "Cardiology", "Pediatrics"

  @ManyToOne(() => Department, (department) => department.specializations)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column() // Explicitly define the foreign key column
  department_id: number;
}
