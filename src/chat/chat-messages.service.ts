import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { ChatMessage, MessageSenderType } from './entities/chat-message.entity';
import { ChatRoom } from './entities/chat-room.entity';

@Injectable()
export class ChatMessagesService {
  constructor(
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(ChatRoom) // To verify room existence and authorization
    private chatRoomRepository: Repository<ChatRoom>,
    private usersService: UsersService, // For sender validation
  ) {}

  async sendMessage(
    roomId: number,
    senderId: number,
    content: string,
  ): Promise<ChatMessage> {
    const room = await this.chatRoomRepository.findOne({
      where: { id: roomId },
    });
    if (!room) {
      throw new NotFoundException(`Chat room with ID ${roomId} not found.`);
    }

    const sender = await this.usersService.findById(senderId);
    if (!sender) {
      throw new NotFoundException(`Sender with ID ${senderId} not found.`);
    }

    let senderType: MessageSenderType;
    if (sender.user_id === room.client_id) {
      senderType = MessageSenderType.CLIENT;
    } else if (
      sender.user_id === room.doctor_id &&
      sender.role.toLowerCase() === UserRole.DOCTOR.toLowerCase()
    ) {
      senderType = MessageSenderType.DOCTOR;
    } else {
      throw new UnauthorizedException(
        `User ${senderId} is not authorized to send messages in room ${roomId}.`,
      );
    }

    const message = this.chatMessageRepository.create({
      chatRoomId: roomId,
      senderId,
      senderType,
      content,
    });

    // Optionally, update ChatRoom's lastMessageAt or lastMessageSnippet here

    return this.chatMessageRepository.save(message);
  }

  async getMessagesForRoom(
    roomId: number,
    userId: number, // To verify user is part of the room
  ): Promise<ChatMessage[]> {
    const room = await this.chatRoomRepository.findOne({
      where: { id: roomId },
    });
    if (!room) {
      throw new NotFoundException(`Chat room with ID ${roomId} not found.`);
    }

    if (userId !== room.client_id && userId !== room.doctor_id) {
      throw new UnauthorizedException(
        `User ${userId} is not authorized to view messages in room ${roomId}.`,
      );
    }

    return this.chatMessageRepository.find({
      where: { chatRoomId: roomId },
      order: { createdAt: 'ASC' }, // Get messages in chronological order
      relations: ['sender'], // Optionally load sender details
    });
  }

  async markMessageAsRead(
    messageId: number,
    userId: number,
  ): Promise<ChatMessage> {
    const message = await this.chatMessageRepository.findOne({
      where: { id: messageId },
      relations: ['chatRoom'],
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${messageId} not found.`);
    }

    const room = message.chatRoom;
    // Check if the user trying to mark as read is the recipient
    const isClientRecipient =
      room.client_id === userId &&
      message.senderType === MessageSenderType.DOCTOR;
    const isDoctorRecipient =
      room.doctor_id === userId &&
      message.senderType === MessageSenderType.CLIENT;

    if (!isClientRecipient && !isDoctorRecipient) {
      throw new UnauthorizedException(
        `User ${userId} cannot mark this message as read.`,
      );
    }

    if (!message.readAt) {
      // Mark as read only if not already read
      message.readAt = new Date();
      return this.chatMessageRepository.save(message);
    }
    return message; // Return message as is if already read
  }
}
