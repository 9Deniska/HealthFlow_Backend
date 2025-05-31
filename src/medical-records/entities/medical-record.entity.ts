import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { User } from '../../users/entities/user.entity';

@Entity('Medical_records') // Matches your table name
export class MedicalRecord {
  @PrimaryGeneratedColumn()
  medical_record_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' }) // Or your preferred onDelete action
  @JoinColumn({ name: 'client_id' })
  client: User;

  @Column()
  client_id: number;

  @ManyToOne(() => Doctor, { onDelete: 'CASCADE' }) // Or your preferred onDelete action
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @Column()
  doctor_id: number;

  // Assuming one medical record per appointment for now.
  // If an appointment can have only one medical record, this could be OneToOne.
  // If this FK should be unique, add { unique: true } to @Column or @JoinColumn.
  @ManyToOne(() => Appointment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @Column()
  appointment_id: number;

  @Column({ type: 'text', nullable: true })
  complaints: string | null;

  @Column({ type: 'text', nullable: true })
  diagnosis: string | null;

  @Column({ type: 'text', nullable: true })
  prescriptions: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
