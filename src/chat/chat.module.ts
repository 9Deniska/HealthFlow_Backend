import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorsModule } from '../doctors/doctors.module'; // For doctor validation
import { UsersModule } from '../users/users.module'; // For user validation
import { ChatMessagesService } from './chat-messages.service';
import { ChatRoomsService } from './chat-rooms.service';
import { ChatController } from './chat.controller';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatRoom } from './entities/chat-room.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRoom, ChatMessage]),
    UsersModule,
    DoctorsModule,
  ],
  providers: [ChatRoomsService, ChatMessagesService],
  controllers: [ChatController],
  exports: [ChatRoomsService, ChatMessagesService], // Export if needed elsewhere
})
export class ChatModule {}
