import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsDecimal,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { AppointmentStatus } from '../entities/appointment.entity';

export class CreateAppointmentDto {
  @IsInt()
  @IsNotEmpty()
  client_id: number;

  @IsInt()
  @IsNotEmpty()
  doctor_id: number;

  @IsDateString()
  @IsNotEmpty()
  appointment_date: string; // YYYY-MM-DD

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'start_time must be in HH:MM format',
  })
  start_time: string; // HH:MM

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'end_time must be in HH:MM format',
  })
  end_time: string; // HH:MM

  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @IsDecimal({ decimal_digits: '2' })
  @IsNotEmpty()
  @Type(() => String) // Ensure transformation for validation if needed from number
  price: string; // Validated as decimal string, will be number in DB

  @IsBoolean()
  @IsOptional()
  is_paid?: boolean;

  @IsDateString()
  @IsOptional()
  payment_date?: string;
}
