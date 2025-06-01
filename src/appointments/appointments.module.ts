import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorsModule } from '../doctors/doctors.module'; // Import DoctorsModule
import { AppointmentsController } from './appointments.controller'; // Assuming controller name
import { AppointmentsService } from './appointments.service';
import { Appointment } from './entities/appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment]), DoctorsModule], // Add DoctorsModule
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService], // Export if other modules (like ReviewsModule) will need it
})
export class AppointmentsModule {}
