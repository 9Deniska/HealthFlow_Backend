import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DeepPartial, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    let hash: string | undefined = undefined;
    if (dto.password) {
      hash = await bcrypt.hash(dto.password, 10);
    }

    const userPayloadForCreation: DeepPartial<User> = {
      name: dto.name,
      surname: dto.surname,
      middlename: dto.middlename,
      date_of_birth: dto.date_of_birth
        ? new Date(dto.date_of_birth)
        : undefined,
      email: dto.email,
      phone: dto.phone,
      role: dto.role,
      google_id: dto.google_id,
      password_hash:
        hash ||
        (dto.google_id
          ? 'google_signed_up_user_placeholder_hash'
          : 'placeholder_for_non_google_missing_password'),
    };

    const user = this.usersRepo.create(userPayloadForCreation);
    try {
      return await this.usersRepo.save(user);
    } catch (error: unknown) {
      let errorMessage = '';
      let isDuplicateError = false;

      if (error && typeof error === 'object') {
        if (
          ('code' in error &&
            (error as { code?: string }).code === 'ER_DUP_ENTRY') ||
          ('errno' in error && (error as { errno?: number }).errno === 1062)
        ) {
          isDuplicateError = true;
        }
        if (
          'message' in error &&
          typeof (error as { message?: unknown }).message === 'string'
        ) {
          errorMessage = (
            (error as { message: string }).message || ''
          ).toLowerCase();
        }
      }

      if (isDuplicateError) {
        if (errorMessage.includes('email')) {
          throw new ConflictException('User with this email already exists.');
        }
        if (errorMessage.includes('phone')) {
          throw new ConflictException(
            'User with this phone number already exists.',
          );
        }
        throw new ConflictException(
          'A user with some of these details already exists.',
        );
      }
      throw error;
    }
  }

  async findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  async findByPhone(phone: string) {
    return this.usersRepo.findOne({ where: { phone } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { google_id: googleId } });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepo.findOne({ where: { user_id: id } });
  }

  async findAllClients(): Promise<User[]> {
    return this.usersRepo.find({ where: { role: UserRole.CLIENT } });
  }

  async update(userId: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { user_id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    if (dto.password) {
      user.password_hash = await bcrypt.hash(dto.password, 10);
    }

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.surname !== undefined) user.surname = dto.surname;
    if (dto.middlename !== undefined) user.middlename = dto.middlename;
    if (dto.date_of_birth !== undefined)
      user.date_of_birth = new Date(dto.date_of_birth);
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.google_id !== undefined) user.google_id = dto.google_id;

    return this.usersRepo.save(user);
  }
}
