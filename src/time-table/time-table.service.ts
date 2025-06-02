import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateTimeTableDto } from './dto/create-time-table.dto';
import { TimeTable } from './entities/time-table.entity';

@Injectable()
export class TimeTableService {
  constructor(
    @InjectRepository(TimeTable)
    private timeTableRepo: Repository<TimeTable>,
  ) {}

  async create(createTimeTableDto: CreateTimeTableDto): Promise<TimeTable> {
    const newTimeTableEntry = this.timeTableRepo.create(createTimeTableDto);
    return this.timeTableRepo.save(newTimeTableEntry);
  }

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

  async findOne(id: number): Promise<TimeTable> {
    const timeTableEntry = await this.timeTableRepo.findOne({
      where: { time_table_id: id },
    });
    if (!timeTableEntry) {
      throw new NotFoundException(`TimeTable entry with ID ${id} not found`);
    }
    return timeTableEntry;
  }

  async remove(id: number): Promise<void> {
    const result = await this.timeTableRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `TimeTable entry with ID ${id} not found to delete`,
      );
    }
  }

  // Add create, findOne, update, remove methods as needed in the future
}
