import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRole {
  DOCTOR = 'doctor',
  CLIENT = 'client',
  MANAGER = 'manager',
  MODERATOR = 'moderator',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column()
  name: string;

  @Column()
  surname: string;

  @Column({ nullable: true })
  middlename?: string;

  @Column()
  date_of_birth: Date;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column()
  password_hash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role: UserRole;

  @Column({ nullable: true })
  google_id?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  registration_date: Date;
}
