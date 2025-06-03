import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { User } from '../../users/entities/user.entity';

@Entity('chat_rooms')
@Unique(['doctor_id', 'client_id']) // Use DB column names
export class ChatRoom {
  @PrimaryGeneratedColumn() // Default is int auto-increment
  id: number; // Type to number

  @Column({ name: 'doctor_id' })
  doctor_id: number;

  @ManyToOne(() => Doctor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @Column({ name: 'client_id' })
  client_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: User;

  // Could add lastMessageAt, lastMessageSnippet if needed for previews

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
