import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { Prisma, Room } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new room' })
  @ApiResponse({ status: 201, description: 'The room has been successfully created.', type: Object })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async create(@Body() data: Prisma.RoomCreateInput): Promise<Room> {
    return this.roomsService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all rooms' })
  @ApiResponse({ status: 200, description: 'Return all rooms.', type: [Object] })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'location', required: false, type: String })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('name') name?: string,
    @Query('location') location?: string,
  ): Promise<Room[]> {
    const where: Prisma.RoomWhereInput = {};
    
    if (name) {
      where.name = { contains: name };
    }
    
    if (location) {
      where.location = { contains: location };
    }
    
    return this.roomsService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      where,
      orderBy: { name: 'asc' },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a room by id' })
  @ApiResponse({ status: 200, description: 'Return the room.', type: Object })
  @ApiResponse({ status: 404, description: 'Room not found.' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string): Promise<Room> {
    const room = await this.roomsService.findOne(id);
    if (!room) {
      throw new Error('Room not found');
    }
    return room;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a room' })
  @ApiResponse({ status: 200, description: 'The room has been successfully updated.', type: Object })
  @ApiResponse({ status: 404, description: 'Room not found.' })
  @ApiParam({ name: 'id', type: String })
  async update(
    @Param('id') id: string,
    @Body() data: Prisma.RoomUpdateInput,
  ): Promise<Room> {
    return this.roomsService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a room' })
  @ApiResponse({ status: 200, description: 'The room has been successfully deleted.', type: Object })
  @ApiResponse({ status: 404, description: 'Room not found.' })
  @ApiParam({ name: 'id', type: String })
  async remove(@Param('id') id: string): Promise<Room> {
    return this.roomsService.remove(id);
  }
}
