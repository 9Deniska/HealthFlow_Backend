import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { TimeTableStatus } from '../entities/time-table.entity';

export class CreateTimeTableDto {
  @IsInt()
  @IsNotEmpty()
  doctor_id: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format',
  })
  date: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'start_time must be in HH:MM format',
  })
  start_time: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'end_time must be in HH:MM format',
  })
  end_time: string;

  @IsOptional()
  @IsEnum(TimeTableStatus)
  status?: TimeTableStatus;
}
