import { Controller, Patch, Param, Body, Get, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReservationStatus } from '@prisma/client';

@Controller('admin/override')
export class OverrideController {
  constructor(private prisma: PrismaService) {}

  @Patch('reservation/:id')
  async overrideReservation(
    @Param('id') id: string,
    @Body() data: {
      status?: ReservationStatus;
      notes?: string;
      adminId: string;
    },
  ) {
    // Verify the reservation exists
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    // Verify the admin exists
    const admin = await this.prisma.user.findUnique({
      where: { id: data.adminId },
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new ForbiddenException('Only administrators can perform override operations');
    }

    // Validate the status transition
    if (data.status) {
      // Some status transitions might not be allowed even for admins
      if (
        reservation.status === ReservationStatus.COMPLETED &&
        data.status !== ReservationStatus.CANCELED
      ) {
        throw new BadRequestException('Cannot change status of a completed reservation except to cancel it');
      }
    }

    // Perform the override
    const updatedReservation = await this.prisma.reservation.update({
      where: { id },
      data: {
        status: data.status,
        notes: data.notes ? `${reservation.notes || ''}\n[ADMIN OVERRIDE] ${data.notes}` : reservation.notes,
        lastModifiedBy: data.adminId,
      },
    });

    // Log the override action
    await this.prisma.activityLog.create({
      data: {
        action: 'RESERVATION_OVERRIDE',
        resourceId: id,
        resourceType: 'RESERVATION',
        userId: data.adminId,
        details: JSON.stringify({
          previousStatus: reservation.status,
          newStatus: data.status,
          notes: data.notes,
        }),
      },
    });

    return updatedReservation;
  }

  @Get('logs')
  async getOverrideLogs() {
    return this.prisma.activityLog.findMany({
      where: {
        action: 'RESERVATION_OVERRIDE',
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
