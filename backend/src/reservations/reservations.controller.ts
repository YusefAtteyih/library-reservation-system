import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { Reservation, ReservationStatus } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';

@ApiTags('reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reservation' })
  @ApiResponse({ status: 201, description: 'The reservation has been successfully created.', type: Object })
  @ApiResponse({ status: 400, description: 'Invalid input or reservation conflict.' })
  @ApiResponse({ status: 404, description: 'Resource not found.' })
  async create(@Body() data: {
    userId: string;
    roomId?: string;
    seatId?: string;
    timeslotId: string;
    notes?: string;
  }): Promise<Reservation> {
    return this.reservationsService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reservations' })
  @ApiResponse({ status: 200, description: 'Return all reservations.', type: [Object] })
  @ApiQuery({ name: 'status', required: false, enum: ReservationStatus })
  @ApiQuery({ name: 'userId', required: false, type: String })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: ReservationStatus,
    @Query('userId') userId?: string,
  ): Promise<Reservation[]> {
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    return this.reservationsService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all reservations for a user' })
  @ApiResponse({ status: 200, description: 'Return all reservations for the specified user.', type: [Object] })
  @ApiParam({ name: 'userId', type: String })
  async findByUser(@Param('userId') userId: string): Promise<Reservation[]> {
    return this.reservationsService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a reservation by id' })
  @ApiResponse({ status: 200, description: 'Return the reservation.', type: Object })
  @ApiResponse({ status: 404, description: 'Reservation not found.' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string): Promise<Reservation> {
    return this.reservationsService.findOne(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a reservation' })
  @ApiResponse({ status: 200, description: 'The reservation has been successfully canceled.', type: Object })
  @ApiResponse({ status: 400, description: 'Invalid operation.' })
  @ApiResponse({ status: 404, description: 'Reservation not found.' })
  @ApiParam({ name: 'id', type: String })
  async cancel(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ): Promise<Reservation> {
    return this.reservationsService.cancel(id, userId);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a reservation (admin only)' })
  @ApiResponse({ status: 200, description: 'The reservation has been successfully approved.', type: Object })
  @ApiResponse({ status: 400, description: 'Invalid operation.' })
  @ApiResponse({ status: 404, description: 'Reservation not found.' })
  @ApiParam({ name: 'id', type: String })
  async approve(@Param('id') id: string): Promise<Reservation> {
    return this.reservationsService.approve(id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a reservation (admin only)' })
  @ApiResponse({ status: 200, description: 'The reservation has been successfully rejected.', type: Object })
  @ApiResponse({ status: 400, description: 'Invalid operation.' })
  @ApiResponse({ status: 404, description: 'Reservation not found.' })
  @ApiParam({ name: 'id', type: String })
  async reject(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ): Promise<Reservation> {
    return this.reservationsService.reject(id, reason);
  }

  @Post('check-in')
  @ApiOperation({ summary: 'Check in to a reservation using QR code' })
  @ApiResponse({ status: 200, description: 'Successfully checked in.', type: Object })
  @ApiResponse({ status: 400, description: 'Invalid check-in attempt.' })
  @ApiResponse({ status: 404, description: 'Reservation not found.' })
  @ApiBody({ schema: { properties: { checkInCode: { type: 'string' } } } })
  async checkIn(@Body('checkInCode') checkInCode: string): Promise<Reservation> {
    return this.reservationsService.checkIn(checkInCode);
  }

  @Patch(':id/check-out')
  @ApiOperation({ summary: 'Check out from a reservation (admin only)' })
  @ApiResponse({ status: 200, description: 'Successfully checked out.', type: Object })
  @ApiResponse({ status: 400, description: 'Invalid check-out attempt.' })
  @ApiResponse({ status: 404, description: 'Reservation not found.' })
  @ApiParam({ name: 'id', type: String })
  async checkOut(@Param('id') id: string): Promise<Reservation> {
    return this.reservationsService.checkOut(id);
  }
}
