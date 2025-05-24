import { Test, TestingModule } from '@nestjs/testing';
import { RoomsService } from './rooms.service';
import { PrismaService } from '../prisma/prisma.service';
import { Room, Prisma } from '@prisma/client';

describe('RoomsService', () => {
  let service: RoomsService;
  let prismaService: PrismaService;

  const mockRoom: Room = {
    id: 'test-id',
    name: 'Test Room',
    location: 'Test Location',
    capacity: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    room: {
      findMany: jest.fn().mockResolvedValue([mockRoom]),
      findUnique: jest.fn().mockResolvedValue(mockRoom),
      create: jest.fn().mockResolvedValue(mockRoom),
      update: jest.fn().mockResolvedValue(mockRoom),
      delete: jest.fn().mockResolvedValue(mockRoom),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of rooms', async () => {
      const result = await service.findAll({});
      expect(result).toEqual([mockRoom]);
      expect(prismaService.room.findMany).toHaveBeenCalled();
    });

    it('should apply filters when provided', async () => {
      const params = {
        where: { name: { contains: 'Test' } },
        skip: 0,
        take: 10,
        orderBy: { name: 'asc' as Prisma.SortOrder },
      };
      
      await service.findAll(params);
      
      expect(prismaService.room.findMany).toHaveBeenCalledWith(params);
    });
  });

  describe('findOne', () => {
    it('should return a single room', async () => {
      const result = await service.findOne('test-id');
      expect(result).toEqual(mockRoom);
      expect(prismaService.room.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        include: {
          seats: true,
          timeslots: true,
        },
      });
    });
  });

  describe('create', () => {
    it('should create a new room', async () => {
      const createRoomDto: Prisma.RoomCreateInput = {
        name: 'New Room',
        location: 'New Location',
        capacity: 15,
      };
      
      await service.create(createRoomDto);
      
      expect(prismaService.room.create).toHaveBeenCalledWith({
        data: createRoomDto,
      });
    });
  });

  describe('update', () => {
    it('should update a room', async () => {
      const updateRoomDto: Prisma.RoomUpdateInput = {
        name: 'Updated Room',
      };
      
      await service.update('test-id', updateRoomDto);
      
      expect(prismaService.room.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: updateRoomDto,
      });
    });
  });

  describe('remove', () => {
    it('should delete a room', async () => {
      await service.remove('test-id');
      
      expect(prismaService.room.delete).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
    });
  });
});
