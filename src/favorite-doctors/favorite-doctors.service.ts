import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavoriteDoctor } from './entities/favorite-doctor.entity';

@Injectable()
export class FavoriteDoctorsService {
  constructor(
    @InjectRepository(FavoriteDoctor)
    private favoriteDoctorsRepository: Repository<FavoriteDoctor>,
  ) {}

  async findFavoritesByClientId(clientId: number): Promise<FavoriteDoctor[]> {
    return this.favoriteDoctorsRepository.find({
      where: { client_id: clientId },
    });
  }

  async addFavorite(
    clientId: number,
    doctorId: number,
  ): Promise<FavoriteDoctor> {
    // Check if the favorite already exists to prevent duplicates
    const existingFavorite = await this.favoriteDoctorsRepository.findOne({
      where: { client_id: clientId, doctor_id: doctorId },
    });

    if (existingFavorite) {
      // Or throw a ConflictException, depending on desired behavior
      return existingFavorite;
    }

    const newFavorite = this.favoriteDoctorsRepository.create({
      client_id: clientId,
      doctor_id: doctorId,
    });
    return this.favoriteDoctorsRepository.save(newFavorite);
  }

  async removeFavorite(clientId: number, doctorId: number): Promise<void> {
    const result = await this.favoriteDoctorsRepository.delete({
      client_id: clientId,
      doctor_id: doctorId,
    });
    if (result.affected === 0) {
      // Optional: Throw NotFoundException if no favorite was found to delete
      // throw new NotFoundException(`Favorite entry not found for client ${clientId} and doctor ${doctorId}`);
    }
  }
}
