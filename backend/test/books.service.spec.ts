import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { PrismaService } from '../prisma/prisma.service';
import { Book, Prisma, BookStatus } from '@prisma/client';

describe('BooksService', () => {
  let service: BooksService;
  let prismaService: PrismaService;

  const mockBook: Book = {
    id: 'test-id',
    isbn: '9780123456789',
    title: 'Test Book',
    author: 'Test Author',
    year: 2023,
    status: BookStatus.AVAILABLE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    book: {
      findMany: jest.fn().mockResolvedValue([mockBook]),
      findUnique: jest.fn().mockResolvedValue(mockBook),
      create: jest.fn().mockResolvedValue(mockBook),
      update: jest.fn().mockResolvedValue(mockBook),
      delete: jest.fn().mockResolvedValue(mockBook),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of books', async () => {
      const result = await service.findAll({});
      expect(result).toEqual([mockBook]);
      expect(prismaService.book.findMany).toHaveBeenCalled();
    });

    it('should apply filters when provided', async () => {
      const params = {
        where: { title: { contains: 'Test' } },
        skip: 0,
        take: 10,
        orderBy: { title: 'asc' as Prisma.SortOrder },
      };
      
      await service.findAll(params);
      
      expect(prismaService.book.findMany).toHaveBeenCalledWith(params);
    });
  });

  describe('findOne', () => {
    it('should return a single book', async () => {
      const result = await service.findOne('test-id');
      expect(result).toEqual(mockBook);
      expect(prismaService.book.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        include: {
          loans: true,
        },
      });
    });
  });

  describe('create', () => {
    it('should create a new book', async () => {
      const createBookDto: Prisma.BookCreateInput = {
        isbn: '9780987654321',
        title: 'New Book',
        author: 'New Author',
        year: 2024,
      };
      
      await service.create(createBookDto);
      
      expect(prismaService.book.create).toHaveBeenCalledWith({
        data: createBookDto,
      });
    });
  });

  describe('update', () => {
    it('should update a book', async () => {
      const updateBookDto: Prisma.BookUpdateInput = {
        title: 'Updated Book',
      };
      
      await service.update('test-id', updateBookDto);
      
      expect(prismaService.book.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: updateBookDto,
      });
    });
  });

  describe('remove', () => {
    it('should delete a book', async () => {
      await service.remove('test-id');
      
      expect(prismaService.book.delete).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
    });
  });

  describe('search', () => {
    it('should search books by query', async () => {
      await service.search('test query');
      
      expect(prismaService.book.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: 'test query', mode: 'insensitive' } },
            { author: { contains: 'test query', mode: 'insensitive' } },
            { isbn: { contains: 'test query' } },
          ],
        },
        orderBy: { title: 'asc' },
      });
    });
  });

  describe('updateStatus', () => {
    it('should update a book status', async () => {
      await service.updateStatus('test-id', BookStatus.ON_LOAN);
      
      expect(prismaService.book.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: { status: BookStatus.ON_LOAN },
      });
    });
  });
});
