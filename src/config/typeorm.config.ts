// src/config/typeorm.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database:
    process.env.NODE_ENV === 'test' ? ':memory:' : 'src/data/app.sqlite', // ← this file lives in your repo
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  synchronize: true, // disable in production!
};
