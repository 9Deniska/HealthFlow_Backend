import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
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

@Injectable()
export class AuthService {
  private resetCodes: Record<string, ResetCodeInfo> = {}; // In-memory store for reset codes
  private googleClient: OAuth2Client;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);
    const payload = { sub: user.user_id, role: user.role };
    return { token: this.jwtService.sign(payload) };
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
    return { token: this.jwtService.sign(payload) };
  }

  async googleLogin(dto: GoogleLoginDto): Promise<{ token: string }> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: dto.credential,
        audience: dto.clientId,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email || !payload.sub) {
        throw new UnauthorizedException('Invalid Google token');
      }

      const { email, sub: google_id, given_name, family_name } = payload;

      let user = await this.usersService.findByGoogleId(google_id);

      if (!user) {
        user = await this.usersService.findByEmail(email);
        if (user && !user.google_id) {
          await this.usersService.update(user.user_id, { google_id });
          user.google_id = google_id;
        } else if (!user) {
          // Create new user
          const newUserDto: CreateUserDto = {
            email,
            name: given_name || 'N/A',
            surname: family_name || 'N/A',
            google_id,
            phone: dto.phone,
            date_of_birth: dto.date_of_birth,
          };
          user = await this.usersService.create(newUserDto);
        }
      }

      if (!user) {
        throw new UnauthorizedException('Could not process Google login');
      }

      const jwtPayload = { sub: user.user_id, role: user.role };
      return { token: this.jwtService.sign(jwtPayload) };
    } catch (error) {
      console.error('Google login error:', error);
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Google sign-in failed');
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

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit code
    const expires = Date.now() + 10 * 60 * 1000; // Code expires in 10 minutes

    // Store the code with user identifier (email or phone)
    this.resetCodes[dto.login] = { code, expires, userId: user.user_id };

    // await this.emailService.sendPasswordResetCode(user.email, code);
    console.log(`Password reset code for ${dto.login}: ${code}`);

    return { message: 'Password reset code sent.' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const storedCodeInfo = this.resetCodes[dto.login];

    if (!storedCodeInfo) {
      throw new BadRequestException('Invalid or expired reset code.');
    }

    if (Date.now() > storedCodeInfo.expires) {
      delete this.resetCodes[dto.login]; // Clean up expired code
      throw new BadRequestException('Reset code has expired.');
    }

    if (storedCodeInfo.code !== dto.code) {
      throw new BadRequestException('Invalid reset code.');
    }

    // const newPasswordHash = await bcrypt.hash(dto.newPassword, 10); // Not needed, UsersService.update will handle hashing

    // Update the user's password in the database
    const userToUpdate = await this.usersService.findById(
      storedCodeInfo.userId,
    );
    if (!userToUpdate) {
      // Should not happen if code was valid and linked to a user
      delete this.resetCodes[dto.login];
      throw new NotFoundException('User not found for password update.');
    }

    await this.usersService.update(storedCodeInfo.userId, {
      password: dto.newPassword,
    });

    delete this.resetCodes[dto.login]; // Clean up used code

    return { message: 'Password has been reset successfully.' };
  }
}
