import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { LoansService } from './loans.service';
import { Loan, LoanStatus } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';

@ApiTags('loans')
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new loan (borrow a book)' })
  @ApiResponse({ status: 201, description: 'The loan has been successfully created.', type: Object })
  @ApiResponse({ status: 400, description: 'Invalid input or loan conflict.' })
  @ApiResponse({ status: 404, description: 'Resource not found.' })
  async create(@Body() data: {
    userId: string;
    bookId: string;
    dueDate?: Date;
  }): Promise<Loan> {
    return this.loansService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all loans' })
  @ApiResponse({ status: 200, description: 'Return all loans.', type: [Object] })
  @ApiQuery({ name: 'status', required: false, enum: LoanStatus })
  @ApiQuery({ name: 'userId', required: false, type: String })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: LoanStatus,
    @Query('userId') userId?: string,
  ): Promise<Loan[]> {
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    return this.loansService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get all overdue loans' })
  @ApiResponse({ status: 200, description: 'Return all overdue loans.', type: [Object] })
  async findOverdue(): Promise<Loan[]> {
    return this.loansService.findOverdue();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all loans for a user' })
  @ApiResponse({ status: 200, description: 'Return all loans for the specified user.', type: [Object] })
  @ApiParam({ name: 'userId', type: String })
  async findByUser(@Param('userId') userId: string): Promise<Loan[]> {
    return this.loansService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a loan by id' })
  @ApiResponse({ status: 200, description: 'Return the loan.', type: Object })
  @ApiResponse({ status: 404, description: 'Loan not found.' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string): Promise<Loan> {
    return this.loansService.findOne(id);
  }

  @Patch(':id/return')
  @ApiOperation({ summary: 'Return a borrowed book' })
  @ApiResponse({ status: 200, description: 'The book has been successfully returned.', type: Object })
  @ApiResponse({ status: 400, description: 'Invalid operation.' })
  @ApiResponse({ status: 404, description: 'Loan not found.' })
  @ApiParam({ name: 'id', type: String })
  async return(@Param('id') id: string): Promise<Loan> {
    return this.loansService.return(id);
  }

  @Patch(':id/extend')
  @ApiOperation({ summary: 'Extend a loan due date' })
  @ApiResponse({ status: 200, description: 'The loan has been successfully extended.', type: Object })
  @ApiResponse({ status: 400, description: 'Invalid operation.' })
  @ApiResponse({ status: 404, description: 'Loan not found.' })
  @ApiParam({ name: 'id', type: String })
  async extend(
    @Param('id') id: string,
    @Body('days') days?: number,
  ): Promise<Loan> {
    return this.loansService.extend(id, days);
  }

  @Post('waitlist')
  @ApiOperation({ summary: 'Join the waitlist for a book' })
  @ApiResponse({ status: 201, description: 'Successfully joined the waitlist.', type: Object })
  @ApiResponse({ status: 400, description: 'Invalid operation.' })
  @ApiResponse({ status: 404, description: 'Resource not found.' })
  async joinWaitlist(@Body() data: {
    userId: string;
    bookId: string;
  }): Promise<any> {
    return this.loansService.joinWaitlist(data);
  }

  @Get('waitlist/:bookId')
  @ApiOperation({ summary: 'Get the waitlist for a book' })
  @ApiResponse({ status: 200, description: 'Return the waitlist for the specified book.', type: [Object] })
  @ApiParam({ name: 'bookId', type: String })
  async getWaitlist(@Param('bookId') bookId: string): Promise<any[]> {
    return this.loansService.getWaitlist(bookId);
  }

  @Delete('waitlist/:id')
  @ApiOperation({ summary: 'Remove a user from the waitlist' })
  @ApiResponse({ status: 200, description: 'Successfully removed from the waitlist.', type: Object })
  @ApiResponse({ status: 404, description: 'Waitlist entry not found.' })
  @ApiParam({ name: 'id', type: String })
  async removeFromWaitlist(@Param('id') id: string): Promise<any> {
    return this.loansService.removeFromWaitlist(id);
  }
}
