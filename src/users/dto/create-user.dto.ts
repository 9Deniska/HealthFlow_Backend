// src/users/dto/create-user.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { UserRole } from './user.entity';

export class CreateUserDto {
  @IsNotEmpty() first_name: string;
  @IsNotEmpty() last_name: string;
  middle_name?: string;

  @IsEmail() email: string;

  @MinLength(6) password: string;

  @IsEnum(UserRole) role: UserRole;
}
