import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { ReservationStatus } from '@prisma/client';

describe('Reservation Workflow (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  
  // Test data
  let userId: string;
  let roomId: string;
  let seatId: string;
  let timeslotId: string;
  let reservationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();
    
    // Set up test data
    const user = await prismaService.user.create({
      data: {
        email: 'test-user@example.com',
        name: 'Test User',
        universityId: 'TEST123',
        role: 'STUDENT',
      },
    });
    userId = user.id;
    
    const room = await prismaService.room.create({
      data: {
        name: 'Test Room',
        location: 'Test Location',
        capacity: 10,
      },
    });
    roomId = room.id;
    
    const seat = await prismaService.seat.create({
      data: {
        label: 'T1',
        room: { connect: { id: roomId } },
      },
    });
    seatId = seat.id;
    
    // Create a timeslot for today
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 1); // 1 hour from now
    
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1); // 2 hours from now
    
    const timeslot = await prismaService.timeslot.create({
      data: {
        startTime,
        endTime,
      },
    });
    timeslotId = timeslot.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prismaService.reservation.deleteMany({
      where: { userId },
    });
    await prismaService.timeslot.delete({
      where: { id: timeslotId },
    });
    await prismaService.seat.delete({
      where: { id: seatId },
    });
    await prismaService.room.delete({
      where: { id: roomId },
    });
    await prismaService.user.delete({
      where: { id: userId },
    });
    
    await app.close();
  });

  it('should create a room reservation', async () => {
    const response = await request(app.getHttpServer())
      .post('/reservations')
      .send({
        userId,
        roomId,
        timeslotId,
        notes: 'Test reservation',
      })
      .expect(201);
    
    expect(response.body).toBeDefined();
    expect(response.body.userId).toBe(userId);
    expect(response.body.roomId).toBe(roomId);
    expect(response.body.timeslotId).toBe(timeslotId);
    expect(response.body.status).toBe(ReservationStatus.PENDING);
    expect(response.body.checkInCode).toBeDefined();
    expect(response.body.qrCodeUrl).toBeDefined();
    
    reservationId = response.body.id;
  });

  it('should not allow double booking of the same room', async () => {
    await request(app.getHttpServer())
      .post('/reservations')
      .send({
        userId,
        roomId,
        timeslotId,
        notes: 'Double booking attempt',
      })
      .expect(409); // Conflict
  });

  it('should approve a reservation', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/reservations/${reservationId}/approve`)
      .expect(200);
    
    expect(response.body).toBeDefined();
    expect(response.body.id).toBe(reservationId);
    expect(response.body.status).toBe(ReservationStatus.CONFIRMED);
  });

  it('should check in to a reservation', async () => {
    // First, get the check-in code
    const reservation = await prismaService.reservation.findUnique({
      where: { id: reservationId },
    });
    
    const response = await request(app.getHttpServer())
      .post('/reservations/check-in')
      .send({
        checkInCode: reservation.checkInCode,
      })
      .expect(201);
    
    expect(response.body).toBeDefined();
    expect(response.body.id).toBe(reservationId);
    expect(response.body.status).toBe(ReservationStatus.CHECKED_IN);
  });

  it('should check out from a reservation', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/reservations/${reservationId}/check-out`)
      .expect(200);
    
    expect(response.body).toBeDefined();
    expect(response.body.id).toBe(reservationId);
    expect(response.body.status).toBe(ReservationStatus.COMPLETED);
  });

  it('should get all reservations for a user', async () => {
    const response = await request(app.getHttpServer())
      .get(`/reservations/user/${userId}`)
      .expect(200);
    
    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].userId).toBe(userId);
  });
});
