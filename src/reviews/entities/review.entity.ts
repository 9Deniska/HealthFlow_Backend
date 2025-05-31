import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Appointment } from '../../appointments/entities/appointment.entity'; // Assuming Appointment entity path
import { Doctor } from '../../doctors/entities/doctor.entity';
import { User } from '../../users/entities/user.entity';

@Entity('Reviews') // Matches your table name
export class Review {
  @PrimaryGeneratedColumn()
  review_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' }) // Or your desired onDelete action
  @JoinColumn({ name: 'client_id' })
  client: User;

  @Column()
  client_id: number;

  @ManyToOne(() => Doctor, { onDelete: 'CASCADE' }) // Or your desired onDelete action
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @Column()
  doctor_id: number;

  @ManyToOne(() => Appointment, { onDelete: 'CASCADE' }) // Or your desired onDelete action
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @Column()
  appointment_id: number;

  @Column({ type: 'int' })
  rating: number; // Validation (1-5) can be handled by DTO/service or DB check constraint

  @Column({ type: 'text', nullable: true })
  review: string | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'boolean', default: false })
  is_approved: boolean;
}
