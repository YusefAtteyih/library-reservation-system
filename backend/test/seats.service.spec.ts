import { Test, TestingModule } from '@nestjs/testing';
import { SeatsService } from './seats.service';
import { PrismaService } from '../prisma/prisma.service';
import { Seat, Prisma } from '@prisma/client';

describe('SeatsService', () => {
  let service: SeatsService;
  let prismaService: PrismaService;

  const mockSeat: Seat = {
    id: 'test-id',
    label: 'A1',
    roomId: 'room-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    seat: {
      findMany: jest.fn().mockResolvedValue([mockSeat]),
      findUnique: jest.fn().mockResolvedValue(mockSeat),
      create: jest.fn().mockResolvedValue(mockSeat),
      update: jest.fn().mockResolvedValue(mockSeat),
      delete: jest.fn().mockResolvedValue(mockSeat),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeatsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SeatsService>(SeatsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of seats', async () => {
      const result = await service.findAll({});
      expect(result).toEqual([mockSeat]);
      expect(prismaService.seat.findMany).toHaveBeenCalled();
    });

    it('should apply filters when provided', async () => {
      const params = {
        where: { roomId: 'room-id' },
        skip: 0,
        take: 10,
        orderBy: { label: 'asc' as Prisma.SortOrder },
      };
      
      await service.findAll(params);
      
      expect(prismaService.seat.findMany).toHaveBeenCalledWith({
        ...params,
        include: {
          room: true,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a single seat', async () => {
      const result = await service.findOne('test-id');
      expect(result).toEqual(mockSeat);
      expect(prismaService.seat.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        include: {
          room: true,
          reservations: true,
        },
      });
    });
  });

  describe('create', () => {
    it('should create a new seat', async () => {
      const createSeatDto: Prisma.SeatCreateInput = {
        label: 'B2',
        room: {
          connect: { id: 'room-id' }
        }
      };
      
      await service.create(createSeatDto);
      
      expect(prismaService.seat.create).toHaveBeenCalledWith({
        data: createSeatDto,
      });
    });
  });

  describe('update', () => {
    it('should update a seat', async () => {
      const updateSeatDto: Prisma.SeatUpdateInput = {
        label: 'Updated Seat',
      };
      
      await service.update('test-id', updateSeatDto);
      
      expect(prismaService.seat.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: updateSeatDto,
      });
    });
  });

  describe('remove', () => {
    it('should delete a seat', async () => {
      await service.remove('test-id');
      
      expect(prismaService.seat.delete).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
    });
  });

  describe('findByRoom', () => {
    it('should find seats by room id', async () => {
      await service.findByRoom('room-id');
      
      expect(prismaService.seat.findMany).toHaveBeenCalledWith({
        where: {
          roomId: 'room-id',
        },
        orderBy: {
          label: 'asc',
        },
      });
    });
  });
});
