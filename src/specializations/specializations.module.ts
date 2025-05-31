import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Specialization } from './entities/specialization.entity';
import { SpecializationsService } from './specializations.service';

@Module({
  imports: [TypeOrmModule.forFeature([Specialization])],
  providers: [SpecializationsService],
  exports: [SpecializationsService],
  controllers: [],
})
export class SpecializationsModule {}
