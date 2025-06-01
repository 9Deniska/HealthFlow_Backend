import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { Doctor } from './entities/doctor.entity';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private doctorsRepo: Repository<Doctor>,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    if (
      !createDoctorDto.user.role ||
      createDoctorDto.user.role !== UserRole.DOCTOR
    ) {
      createDoctorDto.user.role = UserRole.DOCTOR;
    }

    const userEntity = await this.usersService.create(createDoctorDto.user);

    const doctorData = {
      doctor_id: userEntity.user_id,
      specialization_id: createDoctorDto.specialization_id,
      rating: createDoctorDto.rating,
      department_id: createDoctorDto.department_id,
      experience_years: createDoctorDto.experience_years,
      cabinet: createDoctorDto.cabinet,
      consultation_price: createDoctorDto.consultation_price,
    };

    const doctor = this.doctorsRepo.create(doctorData as Partial<Doctor>);
    return this.doctorsRepo.save(doctor);
  }

  async findAll(): Promise<Doctor[]> {
    return this.doctorsRepo.find({ relations: ['user', 'department'] });
  }

  async findOneById(id: number): Promise<Doctor> {
    const doctor = await this.doctorsRepo.findOne({
      where: { doctor_id: id },
      relations: ['user', 'department'],
    });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    return doctor;
  }

  async remove(id: number): Promise<void> {
    const doctor = await this.findOneById(id);
    await this.doctorsRepo.remove(doctor);
  }
}
