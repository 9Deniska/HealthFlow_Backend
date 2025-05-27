// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './dto/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const hash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({
      ...dto,
      password_hash: hash,
    });
    return this.usersRepo.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepo.findOne({ where: { user_id: id } });
  }
}
