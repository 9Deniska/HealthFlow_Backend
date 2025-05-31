import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Department } from '../../departments/entities/department.entity';
import { User } from '../../users/entities/user.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  doctor_id: number;

  @OneToOne(() => User, { cascade: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ unique: true })
  user_id: number;

  @Column()
  specialization: string;

  @Column({ type: 'float', nullable: true })
  rating: number;

  @ManyToOne(() => Department, (department) => department.doctors, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'department_id' })
  department: Department | null;

  @Column({ nullable: true })
  department_id: number | null;
}
