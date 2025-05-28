// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigService
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'; // Import TypeOrmModuleOptions
import { AppController } from './app.controller'; // Assuming AppController exists
import { AppService } from './app.service'; // Assuming AppService exists
import { AuthModule } from './auth/auth.module'; // Assuming AuthModule exists and is needed
import { User } from './users/dto/user.entity'; // Import the User entity
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      // Configure ConfigModule
      isGlobal: true, // Make ConfigModule available globally
      envFilePath: '.env', // Specify the .env file path
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Make ConfigService available
      inject: [ConfigService], // Inject ConfigService
      useFactory: async (
        configService: ConfigService,
      ): Promise<TypeOrmModuleOptions> => ({
        type: 'mysql',
        url: configService.get<string>('DATABASE_URL'),
        entities: [User], // Use the imported User entity directly
        synchronize: true,
      }),
    }),
    UsersModule,
    AuthModule, // Ensure AuthModule is correctly imported if it's separate
  ],
  controllers: [AppController], // Add your main app controller
  providers: [AppService], // Add your main app service
})
export class AppModule {}
