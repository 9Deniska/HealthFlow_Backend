import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('favorite_doctors')
@Unique(['client_id', 'doctor_id']) // Ensures a client cannot favorite the same doctor multiple times
export class FavoriteDoctor {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  favorite_id: number;

  @Column({ type: 'int' })
  client_id: number;

  @Column({ type: 'int' })
  doctor_id: number;
}
