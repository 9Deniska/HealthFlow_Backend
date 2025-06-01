import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { MedicalRecord } from './entities/medical-record.entity';
// import { CreateMedicalRecordDto } from './dto/create-medical-record.dto'; // If you add a create endpoint

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectRepository(MedicalRecord)
    private medicalRecordsRepo: Repository<MedicalRecord>,
  ) {}
  async findOne(id: number): Promise<MedicalRecord> {
    const medicalRecord = await this.medicalRecordsRepo.findOne({
      where: { medical_record_id: id },
      relations: ['client', 'doctor', 'appointment'], // Load related entities
    });
    if (!medicalRecord) {
      throw new NotFoundException(`Medical Record with ID ${id} not found`);
    }
    return medicalRecord;
  }

  async findAllByClientId(clientId: number): Promise<MedicalRecord[]> {
    return this.medicalRecordsRepo.find({
      where: { client_id: clientId },
      relations: ['client', 'doctor', 'appointment'], // Load related entities
    });
  }

  async update(
    id: number,
    updateMedicalRecordDto: UpdateMedicalRecordDto,
  ): Promise<MedicalRecord> {
    const medicalRecord = await this.findOne(id); // findOne will throw if not found

    // Merge the new data. Only fields present in DTO will be updated.
    this.medicalRecordsRepo.merge(medicalRecord, updateMedicalRecordDto);
    return this.medicalRecordsRepo.save(medicalRecord);
  }

  // Add findAll, remove methods if needed
}
