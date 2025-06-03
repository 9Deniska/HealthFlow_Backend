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
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
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

  async update(
    id: number,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id); // findOne will throw if not found

    // Store original date and time for end_time recalculation logic
    const originalAppointmentDate = appointment.appointment_date;
    const originalStartTime = appointment.start_time;

    // Update basic fields from DTO
    if (updateAppointmentDto.client_id !== undefined) {
      appointment.client_id = updateAppointmentDto.client_id;
      // Potentially reload client relation if needed: await this.appointmentsRepo.loadRelation(appointment, 'client');
    }
    if (updateAppointmentDto.doctor_id !== undefined) {
      const doctor = await this.doctorsService.findOneById(
        updateAppointmentDto.doctor_id,
      );
      if (!doctor) {
        throw new NotFoundException(
          `Doctor with ID ${updateAppointmentDto.doctor_id} not found.`,
        );
      }
      if (
        doctor.consultation_price === null ||
        doctor.consultation_price === undefined
      ) {
        throw new BadRequestException(
          `Consultation price for Doctor ID ${updateAppointmentDto.doctor_id} is not set.`,
        );
      }
      appointment.doctor_id = updateAppointmentDto.doctor_id;
      appointment.price = doctor.consultation_price; // Update price if doctor changes
      // Potentially reload doctor relation: await this.appointmentsRepo.loadRelation(appointment, 'doctor');
    }
    if (updateAppointmentDto.appointment_date !== undefined) {
      appointment.appointment_date = new Date(
        updateAppointmentDto.appointment_date,
      );
    }
    if (updateAppointmentDto.start_time !== undefined) {
      appointment.start_time = updateAppointmentDto.start_time;
    }
    if (updateAppointmentDto.status !== undefined) {
      appointment.status = updateAppointmentDto.status;
    }

    // Recalculate end_time if appointment_date or start_time has changed
    const newAppointmentDateStr = updateAppointmentDto.appointment_date
      ? updateAppointmentDto.appointment_date
      : dayjs(originalAppointmentDate).format('YYYY-MM-DD');
    const newStartTimeStr = updateAppointmentDto.start_time
      ? updateAppointmentDto.start_time
      : originalStartTime;

    if (
      updateAppointmentDto.appointment_date ||
      updateAppointmentDto.start_time
    ) {
      const fullStartDateTime = dayjs(
        `${newAppointmentDateStr} ${newStartTimeStr}`,
        'YYYY-MM-DD HH:mm',
      );
      if (!fullStartDateTime.isValid()) {
        throw new BadRequestException(
          'Invalid start_time or appointment_date format for end_time calculation.',
        );
      }
      appointment.end_time = fullStartDateTime
        .add(30, 'minute')
        .format('HH:mm');
    }

    return this.appointmentsRepo.save(appointment);
  }

  async markAsPaid(
    appointmentId: string,
  ): Promise<{ success: boolean; message: string }> {
    const id = parseInt(appointmentId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid appointment ID format');
    }

    const appointment = await this.appointmentsRepo.findOne({
      where: { appointment_id: id },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    if (appointment.is_paid) {
      throw new BadRequestException(
        `Appointment with ID ${id} is already paid`,
      );
    }

    await this.appointmentsRepo.update(
      { appointment_id: id },
      {
        is_paid: true,
        payment_date: new Date(),
      },
    );

    return { success: true, message: `Appointment ${id} marked as paid` };
  }
}
