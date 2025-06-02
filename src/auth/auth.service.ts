import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

interface ResetCodeInfo {
  code: string;
  expires: number;
  userId: number;
}

interface GooglePeopleApiResponse {
  phoneNumbers?: Array<{
    value: string;
    type?: string;
    canonicalForm?: string;
  }>;
  birthdays?: Array<{
    date?: { year?: number; month?: number; day?: number };
    text?: string;
  }>;
}

interface GoogleUserInfoResponse {
  email: string;
  sub: string; // This is the Google ID
  given_name?: string;
  family_name?: string;
  name?: string; // Full name
  picture?: string;
  email_verified?: boolean;
}

@Injectable()
export class AuthService {
  private resetCodes: Record<string, ResetCodeInfo> = {};

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private async getGoogleProfileInfoWithAccessToken(
    accessToken: string,
  ): Promise<GoogleUserInfoResponse | null> {
    try {
      const response = await axios.get<GoogleUserInfoResponse>(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error(
        'Error fetching Google user profile info:',
        error.response?.data || error.message,
      );
      return null;
    }
  }

  private async getGoogleUserInfo(
    accessToken: string,
  ): Promise<{ birthDate?: string; phoneNumber?: string }> {
    console.log('accessToken', accessToken);
    try {
      const response = await axios.get<GooglePeopleApiResponse>(
        'https://people.googleapis.com/v1/people/me?personFields=birthdays,phoneNumbers',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      console.log('response', response.data);

      const data = response.data;
      let birthDate: string | undefined;
      let phoneNumber: string | undefined;

      if (data.birthdays && data.birthdays.length > 0) {
        const bday = data.birthdays.find(
          (b) => b.date?.year && b.date?.month && b.date?.day,
        )?.date;
        if (bday && bday.year && bday.month && bday.day) {
          birthDate = `${bday.year}-${String(bday.month).padStart(2, '0')}-${String(bday.day).padStart(2, '0')}`;
        }
      }

      if (data.phoneNumbers && data.phoneNumbers.length > 0) {
        phoneNumber =
          data.phoneNumbers.find((pn) => pn.canonicalForm)?.canonicalForm ??
          data.phoneNumbers[0]?.value;
      }
      return { birthDate, phoneNumber };
    } catch (error) {
      console.error(
        'Error fetching Google People API info:',
        error.response?.data || error.message,
      );
      return {};
    }
  }

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);
    const payload = { sub: user.user_id, role: user.role };
    return { token: this.jwtService.sign(payload), role: user.role };
  }

  async login(dto: LoginDto) {
    const user =
      (await this.usersService.findByEmail(dto.login)) ??
      (await this.usersService.findByPhone(dto.login));

    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.user_id, role: user.role };
    return { token: this.jwtService.sign(payload), role: user.role };
  }

  async googleLogin(
    dto: GoogleLoginDto,
  ): Promise<{ token: string; role: string }> {
    try {
      const profileInfo = await this.getGoogleProfileInfoWithAccessToken(
        dto.accessToken,
      );

      if (!profileInfo || !profileInfo.email || !profileInfo.sub) {
        throw new UnauthorizedException(
          'Invalid or expired Google access token, or missing required profile information.',
        );
      }

      const { email, sub: google_id, given_name, family_name } = profileInfo;

      let user = await this.usersService.findByGoogleId(google_id);
      let fetchedBirthDate: string | undefined = dto.date_of_birth;
      let fetchedPhone: string | undefined = dto.phone;

      const additionalInfo = await this.getGoogleUserInfo(dto.accessToken);
      if (additionalInfo.birthDate) fetchedBirthDate = additionalInfo.birthDate;
      if (additionalInfo.phoneNumber) fetchedPhone = additionalInfo.phoneNumber;

      if (!user) {
        user = await this.usersService.findByEmail(email);
        if (user && !user.google_id) {
          await this.usersService.update(user.user_id, { google_id });
          user.google_id = google_id;
        } else if (!user) {
          const newUserDto: CreateUserDto = {
            email,
            name: given_name || 'N/A',
            surname: family_name || 'N/A',
            google_id,
            phone: fetchedPhone,
            date_of_birth: fetchedBirthDate,
          };
          user = await this.usersService.create(newUserDto);
        }
      }

      if (!user) {
        throw new UnauthorizedException('Could not process Google login.');
      }

      const jwtPayload = { sub: user.user_id, role: user.role };
      return { token: this.jwtService.sign(jwtPayload), role: user.role };
    } catch (error) {
      console.error(
        'Google login error:',
        error.response?.data || error.message || error,
      );
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new UnauthorizedException(
        'Google sign-in failed due to an unexpected error.',
      );
    }
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user =
      (await this.usersService.findByEmail(dto.login)) ??
      (await this.usersService.findByPhone(dto.login));

    if (!user) {
      throw new NotFoundException(
        'If your account exists, a password reset code has been sent.',
      );
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000;

    this.resetCodes[dto.login] = { code, expires, userId: user.user_id };
    console.log(`Password reset code for ${dto.login}: ${code}`);
    return { message: 'Password reset code sent.' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const storedCodeInfo = this.resetCodes[dto.login];

    if (!storedCodeInfo) {
      throw new BadRequestException('Invalid or expired reset code.');
    }

    if (Date.now() > storedCodeInfo.expires) {
      delete this.resetCodes[dto.login];
      throw new BadRequestException('Reset code has expired.');
    }

    if (storedCodeInfo.code !== dto.code) {
      throw new BadRequestException('Invalid reset code.');
    }

    const userToUpdate = await this.usersService.findById(
      storedCodeInfo.userId,
    );
    if (!userToUpdate) {
      delete this.resetCodes[dto.login];
      throw new NotFoundException('User not found for password update.');
    }

    await this.usersService.update(storedCodeInfo.userId, {
      password: dto.newPassword,
    });
    delete this.resetCodes[dto.login];
    return { message: 'Password has been reset successfully.' };
  }
}
