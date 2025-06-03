import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateChatRoomDto {
  @IsInt()
  @IsNotEmpty()
  doctorId: number;

  @IsInt()
  @IsNotEmpty()
  clientId: number;
}
