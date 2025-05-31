import { IsString, Length, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  login: string; // User's email or phone to identify them

  @IsString()
  @Length(6, 6, { message: 'Code must be 6 characters long' })
  code: string;

  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  newPassword: string;
}
