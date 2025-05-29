import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
