import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { UserRole } from '../../users/entities/user.entity';

export class CreateDoctorDto {
  @ValidateNested()
  @Type(() => CreateUserDto)
  @IsNotEmpty()
  user: CreateUserDto;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  specialization_id: string;

  @IsNumber()
  @IsOptional()
  rating?: number;

  @IsInt()
  @IsOptional() // Department can be assigned later or might not exist for all doctors initially
  department_id?: number | null;

  @IsNumber()
  @IsOptional()
  experience_years?: number;

  @IsString()
  @IsOptional()
  @Length(1, 255)
  cabinet?: string;

  @IsNumber()
  @IsOptional()
  consultation_price?: number;

  constructor(partial: Partial<CreateDoctorDto>) {
    Object.assign(this, partial);
    // Ensure the role is set to DOCTOR for the user part
    if (this.user) {
      this.user.role = UserRole.DOCTOR;
    }
  }
}
