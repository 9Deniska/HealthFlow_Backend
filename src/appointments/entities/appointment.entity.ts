import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { User } from '../../users/entities/user.entity';

export enum AppointmentStatus {
  BUSY = 'busy',
  COMPLETED = 'completed',
  UNAVAILABLE = 'unavailable',
}

@Entity('Appointments') // Matches your table name
export class Appointment {
  @PrimaryGeneratedColumn()
  appointment_id: number;

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

  @Column({ type: 'date' })
  appointment_date: Date;

  @Column({ type: 'time' })
  start_time: string; // TypeORM handles TIME as string

  @Column({ type: 'time' })
  end_time: string; // TypeORM handles TIME as string

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.BUSY,
  })
  status: AppointmentStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'boolean', default: false })
  is_paid: boolean;

  @Column({ type: 'datetime', nullable: true })
  payment_date: Date | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // If you need a relation back to Review (one-to-one)
  // @OneToOne(() => Review, review => review.appointment)
  // review: Review;
}
