import { Module } from '@nestjs/common';
import { OverrideController } from './override.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OverrideController],
})
export class AdminModule {}
