import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateMedicalRecordDto {
  @IsInt()
  @IsOptional()
  client_id?: number;

  @IsInt()
  @IsOptional()
  doctor_id?: number;

  @IsInt()
  @IsOptional()
  appointment_id?: number;

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
