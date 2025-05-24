import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BooksService } from './books.service';
import { Prisma, Book, BookStatus } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new book' })
  @ApiResponse({ status: 201, description: 'The book has been successfully created.', type: Object })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async create(@Body() data: Prisma.BookCreateInput): Promise<Book> {
    return this.booksService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all books' })
  @ApiResponse({ status: 200, description: 'Return all books.', type: [Object] })
  @ApiQuery({ name: 'title', required: false, type: String })
  @ApiQuery({ name: 'author', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: BookStatus })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('title') title?: string,
    @Query('author') author?: string,
    @Query('status') status?: BookStatus,
  ): Promise<Book[]> {
    const where: Prisma.BookWhereInput = {};
    
    if (title) {
      where.title = { contains: title, mode: 'insensitive' };
    }
    
    if (author) {
      where.author = { contains: author, mode: 'insensitive' };
    }
    
    if (status) {
      where.status = status;
    }
    
    return this.booksService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      where,
      orderBy: { title: 'asc' },
    });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search books by title, author, or ISBN' })
  @ApiResponse({ status: 200, description: 'Return matching books.', type: [Object] })
  @ApiQuery({ name: 'q', required: true, type: String })
  async search(@Query('q') query: string): Promise<Book[]> {
    return this.booksService.search(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a book by id' })
  @ApiResponse({ status: 200, description: 'Return the book.', type: Object })
  @ApiResponse({ status: 404, description: 'Book not found.' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string): Promise<Book> {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a book' })
  @ApiResponse({ status: 200, description: 'The book has been successfully updated.', type: Object })
  @ApiResponse({ status: 404, description: 'Book not found.' })
  @ApiParam({ name: 'id', type: String })
  async update(
    @Param('id') id: string,
    @Body() data: Prisma.BookUpdateInput,
  ): Promise<Book> {
    return this.booksService.update(id, data);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update a book status' })
  @ApiResponse({ status: 200, description: 'The book status has been successfully updated.', type: Object })
  @ApiResponse({ status: 404, description: 'Book not found.' })
  @ApiParam({ name: 'id', type: String })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: BookStatus,
  ): Promise<Book> {
    return this.booksService.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a book' })
  @ApiResponse({ status: 200, description: 'The book has been successfully deleted.', type: Object })
  @ApiResponse({ status: 404, description: 'Book not found.' })
  @ApiParam({ name: 'id', type: String })
  async remove(@Param('id') id: string): Promise<Book> {
    return this.booksService.remove(id);
  }
}
