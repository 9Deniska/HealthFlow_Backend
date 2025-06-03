import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorsService } from '../doctors/doctors.service';
import { UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { ChatRoom } from './entities/chat-room.entity';

@Injectable()
export class ChatRoomsService {
  private readonly logger = new Logger(ChatRoomsService.name);

  constructor(
    @InjectRepository(ChatRoom)
    private chatRoomRepository: Repository<ChatRoom>,
    private usersService: UsersService, // For validating client exists
    private doctorsService: DoctorsService, // For validating doctor exists
  ) {}

  async createRoom(
    doctorIdParam: number,
    clientIdParam: number,
  ): Promise<ChatRoom> {
    const doctor = await this.doctorsService.findOneById(doctorIdParam);
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorIdParam} not found`);
    }

    const client = await this.usersService.findById(clientIdParam);
    if (
      !client ||
      client.role.toLowerCase() !== UserRole.CLIENT.toLowerCase()
    ) {
      throw new NotFoundException(
        `Client user with ID ${clientIdParam} not found or is not a client.`,
      );
    }

    // Check if room already exists
    let room = await this.chatRoomRepository.findOne({
      where: { doctor_id: doctorIdParam, client_id: clientIdParam },
    });

    if (room) {
      // Optionally, throw a ConflictException or simply return the existing room
      // For now, let's return the existing room to allow users to resume conversation
      return room;
    }

    room = this.chatRoomRepository.create({
      doctor_id: doctorIdParam,
      client_id: clientIdParam,
    });
    return this.chatRoomRepository.save(room);
  }

  async findRoomById(roomId: number): Promise<ChatRoom | null> {
    return this.chatRoomRepository.findOne({
      where: { id: roomId },
      relations: ['client', 'doctor', 'doctor.user'],
    });
  }

  async findRoomsForUser(
    userId: number,
    userRoleString: string,
  ): Promise<ChatRoom[]> {
    const normalizedRole = userRoleString.toLowerCase();

    if (normalizedRole === UserRole.DOCTOR.toLowerCase()) {
      return this.chatRoomRepository.find({
        where: { doctor_id: userId },
        relations: ['client', 'doctor', 'doctor.user'],
      });
    } else if (normalizedRole === UserRole.CLIENT.toLowerCase()) {
      return this.chatRoomRepository.find({
        where: { client_id: userId },
        relations: ['client', 'doctor', 'doctor.user'],
      });
    }
    this.logger.warn(
      `findRoomsForUser called for unhandled role: ${userRoleString} by userId: ${userId}`,
    );
    return [];
  }

  async getRoomForDoctorAndClient(
    doctorIdParam: number,
    clientIdParam: number,
  ): Promise<ChatRoom | null> {
    return this.chatRoomRepository.findOne({
      where: { doctor_id: doctorIdParam, client_id: clientIdParam },
      relations: ['client', 'doctor', 'doctor.user'],
    });
  }
}
