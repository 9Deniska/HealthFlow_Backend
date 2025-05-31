import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentsRepo: Repository<Department>,
  ) {}

  async findAll(): Promise<Department[]> {
    return this.departmentsRepo.find();
  }

  async findOne(id: number): Promise<Department | null> {
    const department = await this.departmentsRepo.findOne({
      where: { id },
    });
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return department;
  }
}
