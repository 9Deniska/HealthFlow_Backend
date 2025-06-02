import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { IsOldEnough } from '../../common/validators/is-old-enough.validator';
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
  @IsOldEnough(16, { message: 'Користувачу повинно бути щонайменше 16 років' })
  date_of_birth?: string;

  @IsEmail()
  email: string;

  @IsString()
  phone?: string;

  @ValidateIf((o) => !o.google_id)
  @IsNotEmpty({ message: 'Password is required when not using Google login' })
  @IsString()
  password?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  google_id?: string;
}
