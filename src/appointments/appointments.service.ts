import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs'; // Import dayjs
import * as customParseFormat from 'dayjs/plugin/customParseFormat'; // Import plugin for parsing HH:MM
import { Repository } from 'typeorm';
import { DoctorsService } from '../doctors/doctors.service'; // Import DoctorsService
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Appointment } from './entities/appointment.entity';
dayjs.extend(customParseFormat); // Extend dayjs with the plugin

@Injectable()
export class AppointmentsService {
  // Renaming to AppointmentsService for clarity
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepo: Repository<Appointment>,
    private readonly doctorsService: DoctorsService, // Inject DoctorsService
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    const doctor = await this.doctorsService.findOneById(
      createAppointmentDto.doctor_id,
    );
    if (!doctor) {
      throw new NotFoundException(
        `Doctor with ID ${createAppointmentDto.doctor_id} not found.`,
      );
    }
    if (
      doctor.consultation_price === null ||
      doctor.consultation_price === undefined
    ) {
      throw new BadRequestException(
        `Consultation price for Doctor ID ${createAppointmentDto.doctor_id} is not set.`,
      );
    }
    const consultationPrice = doctor.consultation_price;

    // Calculate end_time
    const startTimeString = createAppointmentDto.start_time; // e.g., "10:00"
    const appointmentDateString = createAppointmentDto.appointment_date; // e.g., "2024-07-01"

    // Combine date and time for accurate parsing with dayjs, assuming start_time is on appointment_date
    const fullStartDateTime = dayjs(
      `${appointmentDateString} ${startTimeString}`,
      'YYYY-MM-DD HH:mm',
    );

    if (!fullStartDateTime.isValid()) {
      throw new BadRequestException(
        'Invalid start_time or appointment_date format for end_time calculation.',
      );
    }

    const endTime = fullStartDateTime.add(30, 'minute').format('HH:mm');

    const appointment = this.appointmentsRepo.create({
      ...createAppointmentDto,
      end_time: endTime, // Add calculated end_time
      price: consultationPrice, // Use fetched consultation_price
      is_paid: false,
    });
    return this.appointmentsRepo.save(appointment);
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentsRepo.find({ relations: ['client', 'doctor'] });
  }

  async findOne(id: number): Promise<Appointment> {
    const appointment = await this.appointmentsRepo.findOne({
      where: { appointment_id: id },
      relations: ['client', 'doctor'],
    });
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    return appointment;
  }

  async remove(id: number): Promise<void> {
    const appointment = await this.findOne(id); // Ensures it exists
    await this.appointmentsRepo.remove(appointment);
    // Or: const result = await this.appointmentsRepo.delete(id);
    // if (result.affected === 0) {
    //   throw new NotFoundException(`Appointment with ID ${id} not found`);
    // }
  }

async markAsPaid(appointmentId: string): Promise<void> {
    await this.appointmentsRepo.update(
      { appointment_id: +appointmentId },
      {
        is_paid: true,
        payment_date: new Date(),
      },
    );
  }

}
