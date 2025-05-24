import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SeatsService } from './seats.service';
import { Prisma, Seat } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('seats')
@Controller('seats')
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new seat' })
  @ApiResponse({ status: 201, description: 'The seat has been successfully created.', type: Object })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async create(@Body() data: Prisma.SeatCreateInput): Promise<Seat> {
    return this.seatsService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all seats' })
  @ApiResponse({ status: 200, description: 'Return all seats.', type: [Object] })
  @ApiQuery({ name: 'roomId', required: false, type: String })
  @ApiQuery({ name: 'label', required: false, type: String })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('roomId') roomId?: string,
    @Query('label') label?: string,
  ): Promise<Seat[]> {
    const where: Prisma.SeatWhereInput = {};
    
    if (roomId) {
      where.roomId = roomId;
    }
    
    if (label) {
      where.label = { contains: label };
    }
    
    return this.seatsService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      where,
      orderBy: { label: 'asc' },
    });
  }

  @Get('room/:roomId')
  @ApiOperation({ summary: 'Get all seats in a room' })
  @ApiResponse({ status: 200, description: 'Return all seats in the specified room.', type: [Object] })
  @ApiParam({ name: 'roomId', type: String })
  async findByRoom(@Param('roomId') roomId: string): Promise<Seat[]> {
    return this.seatsService.findByRoom(roomId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a seat by id' })
  @ApiResponse({ status: 200, description: 'Return the seat.', type: Object })
  @ApiResponse({ status: 404, description: 'Seat not found.' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string): Promise<Seat> {
    const seat = await this.seatsService.findOne(id);
    if (!seat) {
      throw new Error('Seat not found');
    }
    return seat;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a seat' })
  @ApiResponse({ status: 200, description: 'The seat has been successfully updated.', type: Object })
  @ApiResponse({ status: 404, description: 'Seat not found.' })
  @ApiParam({ name: 'id', type: String })
  async update(
    @Param('id') id: string,
    @Body() data: Prisma.SeatUpdateInput,
  ): Promise<Seat> {
    return this.seatsService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a seat' })
  @ApiResponse({ status: 200, description: 'The seat has been successfully deleted.', type: Object })
  @ApiResponse({ status: 404, description: 'Seat not found.' })
  @ApiParam({ name: 'id', type: String })
  async remove(@Param('id') id: string): Promise<Seat> {
    return this.seatsService.remove(id);
  }
}
