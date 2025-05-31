import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecord } from './entities/medical-record.entity';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecordsService } from './medical-records.service';
// Import UsersModule, DoctorsModule, AppointmentsModule if service needs to validate IDs

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicalRecord]),
    // Consider importing UsersModule, DoctorsModule, AppointmentsModule here
    // if your MedicalRecordsService needs to interact with their services
    // (e.g., to verify client_id, doctor_id, appointment_id exist before creating/updating)
  ],
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService],
  exports: [MedicalRecordsService], // Export if other modules might need it
})
export class MedicalRecordsModule {}
