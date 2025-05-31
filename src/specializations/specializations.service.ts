import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Specialization } from './entities/specialization.entity';

@Injectable()
export class SpecializationsService {
  constructor(
    @InjectRepository(Specialization)
    private specializationsRepo: Repository<Specialization>,
  ) {}

  async findAll(departmentId?: number): Promise<Specialization[]> {
    const queryOptions: {
      where?: { department_id: number };
      relations: string[];
    } = { relations: ['department'] };
    if (departmentId) {
      queryOptions.where = { department_id: departmentId };
    }
    return this.specializationsRepo.find(queryOptions);
  }

  async findOne(id: number): Promise<Specialization> {
    const specialization = await this.specializationsRepo.findOne({
      where: { id },
      relations: ['department'],
    });
    if (!specialization) {
      throw new NotFoundException(`Specialization with ID ${id} not found`);
    }
    return specialization;
  }
}
