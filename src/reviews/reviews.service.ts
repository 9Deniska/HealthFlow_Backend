import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepo: Repository<Review>,
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    // TODO: Add validation: Does appointment_id belong to client_id and doctor_id?
    // TODO: Add validation: Has this client already reviewed this appointment?
    const review = this.reviewsRepo.create(createReviewDto);
    return this.reviewsRepo.save(review);
  }

  async findAll(
    doctorId?: number,
    clientId?: number,
    appointmentId?: number,
  ): Promise<Review[]> {
    const whereClause: FindOptionsWhere<Review> = {};
    if (doctorId) whereClause.doctor_id = doctorId;
    if (clientId) whereClause.client_id = clientId;
    if (appointmentId) whereClause.appointment_id = appointmentId;
    // Add is_approved: true here if you only want to show approved reviews by default

    return this.reviewsRepo.find({
      where: whereClause,
      relations: ['client', 'doctor', 'appointment'], // Load related entities
    });
  }

  async findOne(id: number): Promise<Review> {
    const review = await this.reviewsRepo.findOne({
      where: { review_id: id },
      relations: ['client', 'doctor', 'appointment'],
    });
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    return review;
  }

  async remove(id: number): Promise<void> {
    const review = await this.findOne(id); // Ensures it exists
    await this.reviewsRepo.remove(review);
    // Or: const result = await this.reviewsRepo.delete(id);
    // if (result.affected === 0) {
    //   throw new NotFoundException(`Review with ID ${id} not found`);
    // }
  }

  // Add update/approval methods as needed
  async approveReview(id: number): Promise<Review> {
    const review = await this.findOne(id);
    review.is_approved = true;
    return this.reviewsRepo.save(review);
  }
}
