import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Room, Prisma } from '@prisma/client';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.RoomWhereUniqueInput;
    where?: Prisma.RoomWhereInput;
    orderBy?: Prisma.RoomOrderByWithRelationInput;
  }): Promise<Room[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.room.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async findOne(id: string): Promise<Room | null> {
    return this.prisma.room.findUnique({
      where: { id },
      include: {
        seats: {
          select: {
            id: true,
            name: true,
            description: true,
            label: true,
            roomId: true,
            createdAt: true,
            updatedAt: true
          }
        },
        timeslots: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            dayOfWeek: true,
            roomId: true,
            createdAt: true,
            updatedAt: true
          }
        },
      },
    });
  }

  async create(data: Prisma.RoomCreateInput): Promise<Room> {
    return this.prisma.room.create({
      data,
    });
  }

  async update(id: string, data: Prisma.RoomUpdateInput): Promise<Room> {
    return this.prisma.room.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<Room> {
    return this.prisma.room.delete({
      where: { id },
    });
  }
}
