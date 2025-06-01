import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Doctor } from '../../doctors/entities/doctor.entity';

export enum TimeTableStatus {
  BUSY = 'busy',
  UNAVAILABLE = 'unavailable',
}

@Entity('time_table') // Matches your table name
export class TimeTable {
  @PrimaryGeneratedColumn()
  time_table_id: number;

  @ManyToOne(() => Doctor, { onDelete: 'CASCADE' }) // Or your preferred onDelete action
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @Column()
  doctor_id: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  start_time: string; // TypeORM handles TIME as string

  @Column({ type: 'time' })
  end_time: string; // TypeORM handles TIME as string

  @Column({
    type: 'enum',
    enum: TimeTableStatus,
    nullable: true, // Or set a default value if appropriate
  })
  status: TimeTableStatus | null;
}
