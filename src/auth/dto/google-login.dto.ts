import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class GoogleLoginDto {
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  credential: string; // This is the ID token from Google

  @IsOptional()
  @IsDateString()
  date_of_birth?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  phone?: string;
}
