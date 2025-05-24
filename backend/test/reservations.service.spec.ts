import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { PrismaService } from '../prisma/prisma.service';
import { Reservation, ReservationStatus, Prisma } from '@prisma/client';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('mock-qr-code-data-url'),
}));

describe('ReservationsService', () => {
  let service: ReservationsService;
  let prismaService: PrismaService;

  const mockReservation: Reservation = {
    id: 'test-id',
    userId: 'user-id',
    roomId: 'room-id',
    seatId: null,
    timeslotId: 'timeslot-id',
    status: ReservationStatus.PENDING,
    notes: null,
    checkInCode: 'check-in-code',
    qrCodeUrl: 'qr-code-url',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTimeslot = {
    id: 'timeslot-id',
    startTime: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour in the future
    endTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 2 hours in the future
  };

  const mockPrismaService = {
    reservation: {
      findMany: jest.fn().mockResolvedValue([mockReservation]),
      findUnique: jest.fn().mockResolvedValue(mockReservation),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(mockReservation),
      update: jest.fn().mockResolvedValue(mockReservation),
      delete: jest.fn().mockResolvedValue(mockReservation),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue({ id: 'user-id', name: 'Test User' }),
    },
    room: {
      findUnique: jest.fn().mockResolvedValue({ id: 'room-id', name: 'Test Room' }),
    },
    seat: {
      findUnique: jest.fn().mockResolvedValue({ id: 'seat-id', label: 'A1' }),
    },
    timeslot: {
      findUnique: jest.fn().mockResolvedValue(mockTimeslot),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of reservations', async () => {
      const result = await service.findAll({});
      expect(result).toEqual([mockReservation]);
      expect(prismaService.reservation.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single reservation', async () => {
      const result = await service.findOne('test-id');
      expect(result).toEqual(mockReservation);
      expect(prismaService.reservation.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              universityId: true,
            },
          },
          room: true,
          seat: true,
          timeslot: true,
        },
      });
    });
  });

  describe('findByUser', () => {
    it('should return reservations for a user', async () => {
      const result = await service.findByUser('user-id');
      expect(result).toEqual([mockReservation]);
      expect(prismaService.reservation.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              universityId: true,
            },
          },
          room: true,
          seat: true,
          timeslot: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('create', () => {
    it('should create a room reservation', async () => {
      const createReservationDto = {
        userId: 'user-id',
        roomId: 'room-id',
        timeslotId: 'timeslot-id',
      };
      
      const result = await service.create(createReservationDto);
      
      expect(result).toEqual(mockReservation);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
      });
      expect(prismaService.room.findUnique).toHaveBeenCalledWith({
        where: { id: 'room-id' },
      });
      expect(prismaService.timeslot.findUnique).toHaveBeenCalledWith({
        where: { id: 'timeslot-id' },
      });
      expect(prismaService.reservation.create).toHaveBeenCalled();
    });

    it('should create a seat reservation', async () => {
      const createReservationDto = {
        userId: 'user-id',
        seatId: 'seat-id',
        timeslotId: 'timeslot-id',
      };
      
      const result = await service.create(createReservationDto);
      
      expect(result).toEqual(mockReservation);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
      });
      expect(prismaService.seat.findUnique).toHaveBeenCalledWith({
        where: { id: 'seat-id' },
      });
      expect(prismaService.timeslot.findUnique).toHaveBeenCalledWith({
        where: { id: 'timeslot-id' },
      });
      expect(prismaService.reservation.create).toHaveBeenCalled();
    });

    it('should throw an error if neither roomId nor seatId is provided', async () => {
      const createReservationDto = {
        userId: 'user-id',
        timeslotId: 'timeslot-id',
      };
      
      await expect(service.create(createReservationDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if both roomId and seatId are provided', async () => {
      const createReservationDto = {
        userId: 'user-id',
        roomId: 'room-id',
        seatId: 'seat-id',
        timeslotId: 'timeslot-id',
      };
      
      await expect(service.create(createReservationDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('should cancel a reservation', async () => {
      const result = await service.cancel('test-id', 'user-id');
      
      expect(result).toEqual(mockReservation);
      expect(prismaService.reservation.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        include: { timeslot: true },
      });
      expect(prismaService.reservation.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: { status: ReservationStatus.CANCELED },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              universityId: true,
            },
          },
          room: true,
          seat: true,
          timeslot: true,
        },
      });
    });

    it('should throw an error if the user does not own the reservation', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValueOnce({
        ...mockReservation,
        userId: 'different-user-id',
      });
      
      await expect(service.cancel('test-id', 'user-id')).rejects.toThrow(BadRequestException);
    });
  });

  describe('approve', () => {
    it('should approve a reservation', async () => {
      const result = await service.approve('test-id');
      
      expect(result).toEqual(mockReservation);
      expect(prismaService.reservation.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
      expect(prismaService.reservation.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: { status: ReservationStatus.CONFIRMED },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              universityId: true,
            },
          },
          room: true,
          seat: true,
          timeslot: true,
        },
      });
    });

    it('should throw an error if the reservation is not pending', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValueOnce({
        ...mockReservation,
        status: ReservationStatus.CONFIRMED,
      });
      
      await expect(service.approve('test-id')).rejects.toThrow(BadRequestException);
    });
  });

  describe('checkIn', () => {
    beforeEach(() => {
      mockPrismaService.reservation.findFirst.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.CONFIRMED,
        timeslot: mockTimeslot,
      });
    });

    it('should check in to a reservation', async () => {
      const result = await service.checkIn('check-in-code');
      
      expect(result).toEqual(mockReservation);
      expect(prismaService.reservation.findFirst).toHaveBeenCalledWith({
        where: { checkInCode: 'check-in-code' },
        include: { timeslot: true },
      });
      expect(prismaService.reservation.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: { status: ReservationStatus.CHECKED_IN },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              universityId: true,
            },
          },
          room: true,
          seat: true,
          timeslot: true,
        },
      });
    });

    it('should throw an error if the reservation is not confirmed', async () => {
      mockPrismaService.reservation.findFirst.mockResolvedValueOnce({
        ...mockReservation,
        status: ReservationStatus.PENDING,
        timeslot: mockTimeslot,
      });
      
      await expect(service.checkIn('check-in-code')).rejects.toThrow(BadRequestException);
    });
  });
});
