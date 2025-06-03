import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface'; // Assuming you have this for req.user
import { UserRole } from '../users/entities/user.entity'; // Import UserRole
import { ChatMessagesService } from './chat-messages.service';
import { ChatRoomsService } from './chat-rooms.service';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatRoomsService: ChatRoomsService,
    private readonly chatMessagesService: ChatMessagesService,
  ) {}

  // --- Chat Room Endpoints ---

  @Post('rooms')
  async createRoom(
    @Body(new ValidationPipe()) createChatRoomDto: CreateChatRoomDto,
    @Req() req: RequestWithUser, // To ensure only a doctor can initiate with a specific client, or a client with a doctor
  ) {
    // Basic authorization: ensure the request user is one of the participants
    // More specific role-based creation logic can be in the service
    if (
      req.user.role.toLowerCase() === UserRole.DOCTOR.toLowerCase() && // Normalize role from token
      req.user.sub !== createChatRoomDto.doctorId
    ) {
      throw new UnauthorizedException(
        'Doctor can only create chat rooms for themselves.',
      ); // UnauthorizedException
    }
    if (
      req.user.role.toLowerCase() === UserRole.CLIENT.toLowerCase() && // Normalize role from token
      req.user.sub !== createChatRoomDto.clientId
    ) {
      throw new UnauthorizedException(
        'Client can only create chat rooms for themselves.',
      ); // UnauthorizedException
    }
    return this.chatRoomsService.createRoom(
      createChatRoomDto.doctorId,
      createChatRoomDto.clientId,
    );
  }

  @Get('rooms')
  async getUserRooms(@Req() req: RequestWithUser) {
    console.log('req.user.role', req.user);
    return this.chatRoomsService.findRoomsForUser(req.user.sub, req.user.role);
  }

  @Get('rooms/find') // Example: GET /chat/rooms/find?doctorId=1&clientId=2
  async findSpecificRoom(
    @Query('doctorId', ParseIntPipe) doctorId: number,
    @Query('clientId', ParseIntPipe) clientId: number,
    @Req() req: RequestWithUser,
  ) {
    // Authorization: Ensure user is part of this room query
    if (req.user.sub !== doctorId && req.user.sub !== clientId) {
      throw new UnauthorizedException('Not authorized to find this room'); // UnauthorizedException
    }
    return this.chatRoomsService.getRoomForDoctorAndClient(doctorId, clientId);
  }

  @Get('rooms/:roomId')
  async getRoomById(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Req() req: RequestWithUser,
  ) {
    const room = await this.chatRoomsService.findRoomById(roomId);
    if (
      !room ||
      (room.client_id !== req.user.sub && room.doctor_id !== req.user.sub)
    ) {
      throw new NotFoundException('Room not found or user not authorized'); // NotFoundException or UnauthorizedException
    }
    return room;
  }

  // --- Chat Message Endpoints ---

  @Post('rooms/:roomId/messages')
  async sendMessage(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Body(new ValidationPipe()) sendMessageDto: SendMessageDto,
    @Req() req: RequestWithUser,
  ) {
    return this.chatMessagesService.sendMessage(
      roomId,
      req.user.sub, // senderId is the authenticated user's ID
      sendMessageDto.content,
    );
  }

  @Get('rooms/:roomId/messages')
  async getMessages(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Req() req: RequestWithUser,
  ) {
    return this.chatMessagesService.getMessagesForRoom(roomId, req.user.sub);
  }

  @Patch('messages/:messageId/read')
  async markAsRead(
    @Param('messageId', ParseIntPipe) messageId: number,
    @Req() req: RequestWithUser,
  ) {
    return this.chatMessagesService.markMessageAsRead(messageId, req.user.sub);
  }
}
