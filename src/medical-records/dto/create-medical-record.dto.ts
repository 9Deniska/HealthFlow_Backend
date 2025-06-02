import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMedicalRecordDto {
  @IsInt()
  @IsNotEmpty()
  client_id: number;

  @IsInt()
  @IsNotEmpty()
  doctor_id: number;

  @IsInt()
  @IsNotEmpty()
  appointment_id: number;

  @IsString()
  @IsOptional()
  complaints?: string;

  @IsString()
  @IsOptional()
  diagnosis?: string;

  @IsString()
  @IsOptional()
  prescriptions?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
