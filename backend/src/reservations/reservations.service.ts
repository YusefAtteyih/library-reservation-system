import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Reservation, Prisma, ReservationStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ReservationWhereUniqueInput;
    where?: Prisma.ReservationWhereInput;
    orderBy?: Prisma.ReservationOrderByWithRelationInput;
  }): Promise<Reservation[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.reservation.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            universityId: true,
          },
        },
        seat: {
          include: {
            room: true
          }
        },
        timeslot: true,
      } as const,
    });
  }

  async findOne(id: string): Promise<Reservation | null> {
    return this.prisma.reservation.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            universityId: true,
          },
        },
        seat: {
          include: {
            room: true
          }
        },
        timeslot: true,
      } as const,
    });
  }

  async findByUser(userId: string): Promise<Reservation[]> {
    return this.prisma.reservation.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            universityId: true,
          },
        },
        seat: {
          include: {
            room: true
          }
        },
        timeslot: true,
      } as const,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(data: {
    userId: string;
    roomId?: string;
    seatId?: string;
    timeslotId: string;
    notes?: string;
  }): Promise<Reservation> {
    const { userId, roomId, seatId, timeslotId, notes } = data;

    // Validate that either roomId or seatId is provided, but not both
    if ((!roomId && !seatId) || (roomId && seatId)) {
      throw new BadRequestException('Either roomId or seatId must be provided, but not both');
    }

    // Check if the user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if the timeslot exists
    const timeslot = await this.prisma.timeslot.findUnique({
      where: { id: timeslotId },
    });

    if (!timeslot) {
      throw new NotFoundException('Timeslot not found');
    }

    // Check if the timeslot is in the future
    if (new Date(timeslot.startTime) < new Date()) {
      throw new BadRequestException('Cannot reserve a timeslot in the past');
    }

    // Check if the user has already reserved this timeslot
    const existingUserReservation = await this.prisma.reservation.findFirst({
      where: {
        userId,
        timeslotId,
        status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
      },
    });

    if (existingUserReservation) {
      throw new ConflictException('You already have a reservation for this timeslot');
    }

    // Check for daily booking limit (max 4 hours per day)
    const userDailyReservations = await this.prisma.reservation.findMany({
      where: {
        userId,
        timeslot: {
          startTime: {
            gte: new Date(new Date(timeslot.startTime).setHours(0, 0, 0, 0)),
            lt: new Date(new Date(timeslot.startTime).setHours(24, 0, 0, 0)),
          },
        },
        status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
      },
      include: {
        timeslot: true,
      },
    });

    // Calculate total hours already reserved for the day
    const totalHoursReserved = userDailyReservations.reduce((total, reservation) => {
      if (reservation.timeslot) {
        const start = new Date(reservation.timeslot.startTime);
        const end = new Date(reservation.timeslot.endTime);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return total + hours;
      }
      return total;
    }, 0);

    // Calculate hours for the new reservation
    const newReservationHours = 
      (new Date(timeslot.endTime).getTime() - new Date(timeslot.startTime).getTime()) / (1000 * 60 * 60);

    // Check if adding this reservation would exceed the daily limit
    if (totalHoursReserved + newReservationHours > 4) {
      throw new BadRequestException('Daily reservation limit of 4 hours would be exceeded');
    }

    // Check for conflicts with existing reservations
    if (roomId) {
      // Check if the room exists
      const room = await this.prisma.room.findUnique({
        where: { id: roomId },
      });

      if (!room) {
        throw new NotFoundException('Room not found');
      }

      // Check if room is available
      const roomReservations = await this.prisma.reservation.findMany({
        where: {
          seat: {
            roomId: roomId
          },
          timeslotId,
          status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
        },
      });

      if (roomReservations.length > 0) {
        throw new ConflictException('This room is already reserved for the selected timeslot');
      }
    }

    if (seatId) {
      // Check if the seat exists
      const seat = await this.prisma.seat.findUnique({
        where: { id: seatId },
      });

      if (!seat) {
        throw new NotFoundException('Seat not found');
      }

      // Check for conflicting seat reservations
      const conflictingSeatReservation = await this.prisma.reservation.findFirst({
        where: {
          seatId,
          timeslotId,
          status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
        },
      });

      if (conflictingSeatReservation) {
        throw new ConflictException('This seat is already reserved for the selected timeslot');
      }
    }

    // Generate a unique check-in code
    const checkInCode = uuidv4();

    // Get the timeslot to ensure it exists and get its details
    const timeslotRecord = await this.prisma.timeslot.findUnique({
      where: { id: timeslotId },
    });

    if (!timeslotRecord) {
      throw new NotFoundException('Timeslot not found');
    }

    // Create the reservation
    return this.prisma.reservation.create({
      data: {
        user: { connect: { id: userId } },
        ...(seatId && { 
          seat: { 
            connect: { 
              id: seatId 
            } 
          } 
        }),
        timeslot: { connect: { id: timeslotId } },
        status: ReservationStatus.PENDING, // Default to pending, admin approval required
        notes,
        checkInCode,
        startTime: timeslotRecord.startTime,
        endTime: timeslotRecord.endTime
      } as Prisma.ReservationCreateInput,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            universityId: true,
          },
        },
        seat: {
          include: {
            room: true
          }
        },
        timeslot: true,
      },
    });
  }

  async cancel(id: string, userId: string): Promise<Reservation> {
    // Find the reservation
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { 
        timeslot: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            universityId: true,
          },
        },
        seat: {
          include: {
            room: true
          }
        },
      },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // Check if the user owns this reservation
    if (reservation.userId !== userId) {
      throw new BadRequestException('You can only cancel your own reservations');
    }

    // Check if the reservation is already canceled or completed
    if (reservation.status === ReservationStatus.CANCELLED || 
        reservation.status === ReservationStatus.COMPLETED) {
      throw new BadRequestException(`Reservation is already ${reservation.status.toLowerCase()}`);
    }

    // Check if the reservation is in the future (can't cancel past reservations)
    if (reservation.timeslot && new Date(reservation.timeslot.startTime) < new Date()) {
      throw new BadRequestException('Cannot cancel a reservation that has already started');
    }

    // Update the reservation status to CANCELLED
    return this.prisma.reservation.update({
      where: { id },
      data: { status: ReservationStatus.CANCELLED },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            universityId: true,
          },
        },
        seat: {
          include: {
            room: true
          }
        },
        timeslot: true,
      },
    });
  }

  async checkIn(checkInCode: string): Promise<Reservation> {
    // Find the reservation by check-in code
    const reservation = await this.prisma.reservation.findFirst({
      where: { checkInCode },
      include: { 
        timeslot: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            universityId: true,
          },
        },
        seat: {
          include: {
            room: true
          }
        },
      },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found for this check-in code');
    }

    // Check if the reservation is confirmed
    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException(`Cannot check in to a reservation with status: ${reservation.status}`);
    }

    // Check if the reservation is within the valid check-in window (15 minutes before start time)
    const now = new Date();
    if (!reservation.timeslot) {
      throw new BadRequestException('Invalid timeslot for this reservation');
    }
    const startTime = new Date(reservation.timeslot.startTime);
    const checkInWindowStart = new Date(startTime.getTime() - 15 * 60 * 1000); // 15 minutes before

    if (now < checkInWindowStart) {
      throw new BadRequestException('Check-in is not yet available for this reservation');
    }

    if (now > startTime) {
      const lateMinutes = Math.floor((now.getTime() - startTime.getTime()) / (60 * 1000));
      
      // If more than 15 minutes late, the reservation is forfeited
      if (lateMinutes > 15) {
        return this.prisma.reservation.update({
          where: { id: reservation.id },
          data: { 
            status: ReservationStatus.FORFEITED,
            notes: `${reservation.notes ? reservation.notes + '. ' : ''}Forfeited due to late check-in (${lateMinutes} minutes late).`,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                universityId: true,
              },
            },
            seat: {
              include: {
                room: true
              }
            },
            timeslot: true,
          },
        });
      }
    }

    // Update the reservation status to CHECKED_IN
    return this.prisma.reservation.update({
      where: { id: reservation.id },
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
        seat: {
          include: {
            room: true
          }
        },
        timeslot: true,
      },
    });
  }

  async checkOut(id: string): Promise<Reservation> {
    // Find the reservation
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // Check if the reservation is checked in
    if (reservation.status !== ReservationStatus.CHECKED_IN) {
      throw new BadRequestException('Only checked-in reservations can be checked out');
    }

    // Update the reservation status to COMPLETED
    return this.prisma.reservation.update({
      where: { id },
      data: { status: ReservationStatus.COMPLETED },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            universityId: true,
          },
        },
        seat: {
          include: {
            room: true
          }
        },
        timeslot: true,
      },
    });
  }
}
