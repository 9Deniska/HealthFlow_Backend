import { IsEmail, IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  surname: string;

  @IsOptional()
  @IsString()
  middlename?: string;

  @IsDateString()
  date_of_birth: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  google_id?: string;
}
