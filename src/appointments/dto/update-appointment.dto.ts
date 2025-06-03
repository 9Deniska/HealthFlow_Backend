import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { AppointmentStatus } from '../entities/appointment.entity';

export class UpdateAppointmentDto {
  @IsOptional()
  @IsInt()
  client_id?: number;

  @IsOptional()
  @IsInt()
  doctor_id?: number;

  @IsOptional()
  @IsDateString()
  appointment_date?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'start_time must be in HH:MM format',
  })
  start_time?: string; // HH:MM

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  // is_paid and payment_date are handled by a separate endpoint, so they are not included here.
  // price is determined by the doctor's consultation price, so it is not updatable directly.
}
