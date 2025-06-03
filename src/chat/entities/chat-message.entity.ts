import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ChatRoom } from './chat-room.entity';

export enum MessageSenderType {
  CLIENT = 'client',
  DOCTOR = 'doctor',
}

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'chat_room_id' })
  chatRoomId: number;

  @ManyToOne(() => ChatRoom, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_room_id' })
  chatRoom: ChatRoom;

  @Column({ name: 'sender_id' })
  senderId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({
    type: 'enum',
    enum: MessageSenderType,
    name: 'sender_type',
  })
  senderType: MessageSenderType;

  @Column('text')
  content: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'read_at' })
  readAt?: Date | null;
}
