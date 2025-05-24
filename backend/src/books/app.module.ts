import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RoomsModule } from './rooms/rooms.module';
import { SeatsModule } from './seats/seats.module';
import { BooksModule } from './books/books.module';
import { ReservationsModule } from './reservations/reservations.module';
import { LoansModule } from './loans/loans.module';

@Module({
  imports: [
    PrismaModule, 
    RoomsModule, 
    SeatsModule, 
    BooksModule, 
    ReservationsModule, 
    LoansModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
