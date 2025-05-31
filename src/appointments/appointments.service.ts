import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Appointment } from './entities/appointment.entity';

@Injectable()
export class AppointmentsService {
  // Renaming to AppointmentsService for clarity
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepo: Repository<Appointment>,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    // Additional validation or logic can go here (e.g., check doctor/client existence, time conflicts)
    const appointment = this.appointmentsRepo.create({
      ...createAppointmentDto,
      price: parseFloat(createAppointmentDto.price), // Convert validated string to number for DB
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

  // Add update method as needed
}
