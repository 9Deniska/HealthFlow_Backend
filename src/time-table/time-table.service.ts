import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { TimeTable } from './entities/time-table.entity';

@Injectable()
export class TimeTableService {
  constructor(
    @InjectRepository(TimeTable)
    private timeTableRepo: Repository<TimeTable>,
  ) {}

  async findAll(doctorId?: number, dateString?: string): Promise<TimeTable[]> {
    const where: FindOptionsWhere<TimeTable> = {};

    if (doctorId !== undefined) {
      where.doctor_id = doctorId;
    }
    if (dateString) {
      // Parse YYYY-MM-DD string
      const parts = dateString.split('-').map((part) => parseInt(part, 10));
      if (parts.length === 3) {
        where.date = dateString;
      }
    }

    const results = await this.timeTableRepo.find({
      where,
      relations: ['doctor'],
    });
    return results;
  }

  // Add create, findOne, update, remove methods as needed in the future
}
