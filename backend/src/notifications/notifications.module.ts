import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  controllers: [],
  providers: [PrismaService],
  exports: [],
})
export class NotificationsModule {}
