import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoriteDoctor } from './entities/favorite-doctor.entity';
import { FavoriteDoctorsService } from './favorite-doctors.service';

@Module({
  imports: [TypeOrmModule.forFeature([FavoriteDoctor])],
  providers: [FavoriteDoctorsService],
  exports: [FavoriteDoctorsService], // Export if other modules will need it
})
export class FavoriteDoctorsModule {}
