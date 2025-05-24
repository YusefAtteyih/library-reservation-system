import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Seat, Prisma } from '@prisma/client';

@Injectable()
export class SeatsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.SeatWhereUniqueInput;
    where?: Prisma.SeatWhereInput;
    orderBy?: Prisma.SeatOrderByWithRelationInput;
  }): Promise<Seat[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.seat.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        room: {
          select: {
            id: true,
            name: true,
            location: true,
            description: true,
            capacity: true,
            createdAt: true,
            updatedAt: true
          }
        },
      },
    });
  }

  async findOne(id: string): Promise<Seat | null> {
    return this.prisma.seat.findUnique({
      where: { id },
      include: {
        room: {
          select: {
            id: true,
            name: true,
            location: true,
            description: true,
            capacity: true,
            createdAt: true,
            updatedAt: true
          }
        },
        reservations: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
            userId: true,
            seatId: true,
            createdAt: true,
            updatedAt: true
          }
        },
      },
    });
  }

  async create(data: Prisma.SeatCreateInput): Promise<Seat> {
    return this.prisma.seat.create({
      data,
    });
  }

  async update(id: string, data: Prisma.SeatUpdateInput): Promise<Seat> {
    return this.prisma.seat.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<Seat> {
    return this.prisma.seat.delete({
      where: { id },
    });
  }

  async findByRoom(roomId: string): Promise<Seat[]> {
    return this.prisma.seat.findMany({
      where: {
        roomId,
      },
      orderBy: {
        label: 'asc',
      },
    });
  }
}
