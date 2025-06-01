import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeTable } from './entities/time-table.entity';
import { TimeTableController } from './time-table.controller';
import { TimeTableService } from './time-table.service';
// Import DoctorsModule if service needs to validate doctor_id or for other interactions

@Module({
  imports: [
    TypeOrmModule.forFeature([TimeTable]),
    // DoctorsModule, // If needed
  ],
  controllers: [TimeTableController],
  providers: [TimeTableService],
  exports: [TimeTableService], // Export if other modules might need it
})
export class TimeTableModule {}
