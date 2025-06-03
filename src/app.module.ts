import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppointmentsModule } from './appointments/appointments.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { DepartmentsModule } from './departments/departments.module';
import { DoctorsModule } from './doctors/doctors.module';
import { FavoriteDoctorsModule } from './favorite-doctors/favorite-doctors.module';
import { LiqpayModule } from './liqpay/liqpay.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SpecializationsModule } from './specializations/specializations.module';
import { TimeTableModule } from './time-table/time-table.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', { infer: true }),
        port: config.get<number>('DB_PORT', { infer: true }),
        username: config.get<string>('DB_USERNAME', { infer: true }),
        password: config.get<string>('DB_PASSWORD', { infer: true }),
        database: config.get<string>('DB_NAME', { infer: true }),
        synchronize: false,
        autoLoadEntities: true,
      }),
    }),
    AuthModule,
    UsersModule,
    DoctorsModule,
    DepartmentsModule,
    SpecializationsModule,
    AppointmentsModule,
    ReviewsModule,
    MedicalRecordsModule,
    TimeTableModule,
    FavoriteDoctorsModule,
    LiqpayModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
