import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class GoogleLoginDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsOptional()
  @IsDateString()
  date_of_birth?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  phone?: string;
}
