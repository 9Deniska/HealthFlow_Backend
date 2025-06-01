import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Department } from '../../departments/entities/department.entity';
// Removed FavoriteDoctor import
import { User } from '../../users/entities/user.entity';
// Assuming you have a Specialization entity, import it here
// import { Specialization } from '../../specializations/entities/specialization.entity';

@Entity('doctors') // Table name is 'doctor' as per your DDL
export class Doctor {
  @PrimaryColumn() // doctor_id is the PK
  doctor_id: number;

  // This links to the User entity using doctor_id as the foreign key
  @OneToOne(() => User, { cascade: true, onDelete: 'CASCADE' }) // onDelete matches your DDL
  @JoinColumn({ name: 'doctor_id' }) // Join on the doctor_id column itself
  user: User;

  // Mapping specialization_id
  // If specializations.id is a number, then this should be number.
  // If specializations.id is VARCHAR(50), then this should be string.
  // For now, assuming it's a number based on typical PKs. Adjust if needed.
  @Column({ type: 'varchar', length: 50 }) // Matches VARCHAR(50) from DDL
  specialization_id: string; // This is the foreign key to specializations table

  // If you have a Specialization entity and want the object relation:
  // @ManyToOne(() => Specialization, { onDelete: 'RESTRICT' })
  // @JoinColumn({ name: 'specialization_id' })
  // specialization: Specialization;

  @Column({ type: 'int', nullable: true }) // Matches rating INT NULL
  rating: number | null;

  // department_id is BIGINT UNSIGNED NULL
  @ManyToOne(() => Department, (department) => department.doctors, {
    onDelete: 'SET NULL', // Matches your DDL
    nullable: true,
  })
  @JoinColumn({ name: 'department_id' })
  department: Department | null;

  @Column({ type: 'bigint', unsigned: true, nullable: true }) // Matches DDL
  department_id: number | null;

  @Column({ type: 'int', nullable: true })
  experience_years: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cabinet: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  consultation_price: number | null;
}
