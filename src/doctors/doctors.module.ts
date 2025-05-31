import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { DoctorsService } from './doctors.service';
import { Doctor } from './entities/doctor.entity';
// import { DoctorsController } from './doctors.controller'; // If you create a dedicated controller

@Module({
  imports: [TypeOrmModule.forFeature([Doctor]), forwardRef(() => UsersModule)],
  // controllers: [DoctorsController], // Uncomment if you create DoctorsController
  providers: [DoctorsService],
  exports: [DoctorsService], // Export if other modules need it
})
export class DoctorsModule {}
