import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, FindOptionsWhere, Repository } from 'typeorm';
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
      where.date = Equal(new Date(dateString));
    }

    return this.timeTableRepo.find({
      where,
      relations: ['doctor'],
    });
  }

  // Add create, findOne, update, remove methods as needed in the future
}
