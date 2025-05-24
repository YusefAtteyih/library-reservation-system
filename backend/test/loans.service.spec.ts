import { Test, TestingModule } from '@nestjs/testing';
import { LoansService } from './loans.service';
import { PrismaService } from '../prisma/prisma.service';
import { Loan, LoanStatus, BookStatus } from '@prisma/client';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('LoansService', () => {
  let service: LoansService;
  let prismaService: PrismaService;

  const mockLoan: Loan = {
    id: 'test-id',
    userId: 'user-id',
    bookId: 'book-id',
    dueDate: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days in the future
    returnedDate: null,
    status: LoanStatus.BORROWED,
    extensionCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    loan: {
      findMany: jest.fn().mockResolvedValue([mockLoan]),
      findUnique: jest.fn().mockResolvedValue(mockLoan),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(mockLoan),
      update: jest.fn().mockResolvedValue(mockLoan),
      delete: jest.fn().mockResolvedValue(mockLoan),
      count: jest.fn().mockResolvedValue(0),
    },
    book: {
      findUnique: jest.fn().mockResolvedValue({ 
        id: 'book-id', 
        title: 'Test Book',
        status: BookStatus.AVAILABLE 
      }),
      update: jest.fn().mockResolvedValue({ 
        id: 'book-id', 
        title: 'Test Book',
        status: BookStatus.ON_LOAN 
      }),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue({ id: 'user-id', name: 'Test User' }),
    },
    waitlist: {
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({ id: 'waitlist-id', userId: 'user-id', bookId: 'book-id' }),
      delete: jest.fn().mockResolvedValue({ id: 'waitlist-id', userId: 'user-id', bookId: 'book-id' }),
    },
    $transaction: jest.fn().mockImplementation(callback => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoansService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<LoansService>(LoansService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of loans', async () => {
      const result = await service.findAll({});
      expect(result).toEqual([mockLoan]);
      expect(prismaService.loan.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single loan', async () => {
      const result = await service.findOne('test-id');
      expect(result).toEqual(mockLoan);
      expect(prismaService.loan.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              universityId: true,
            },
          },
          book: true,
        },
      });
    });
  });

  describe('findByUser', () => {
    it('should return loans for a user', async () => {
      const result = await service.findByUser('user-id');
      expect(result).toEqual([mockLoan]);
      expect(prismaService.loan.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              universityId: true,
            },
          },
          book: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('create', () => {
    it('should create a loan', async () => {
      const createLoanDto = {
        userId: 'user-id',
        bookId: 'book-id',
      };
      
      const result = await service.create(createLoanDto);
      
      expect(result).toEqual(mockLoan);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
      });
      expect(prismaService.book.findUnique).toHaveBeenCalledWith({
        where: { id: 'book-id' },
      });
      expect(prismaService.book.update).toHaveBeenCalledWith({
        where: { id: 'book-id' },
        data: { status: BookStatus.ON_LOAN },
      });
      expect(prismaService.loan.create).toHaveBeenCalled();
    });

    it('should throw an error if the book is not available', async () => {
      mockPrismaService.book.findUnique.mockResolvedValueOnce({
        id: 'book-id',
        title: 'Test Book',
        status: BookStatus.ON_LOAN,
      });
      
      const createLoanDto = {
        userId: 'user-id',
        bookId: 'book-id',
      };
      
      await expect(service.create(createLoanDto)).rejects.toThrow(ConflictException);
    });

    it('should throw an error if the user has overdue loans', async () => {
      mockPrismaService.loan.count.mockResolvedValueOnce(1);
      
      const createLoanDto = {
        userId: 'user-id',
        bookId: 'book-id',
      };
      
      await expect(service.create(createLoanDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if the user has reached the maximum number of borrowed books', async () => {
      mockPrismaService.loan.count.mockResolvedValueOnce(0).mockResolvedValueOnce(5);
      
      const createLoanDto = {
        userId: 'user-id',
        bookId: 'book-id',
      };
      
      await expect(service.create(createLoanDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('return', () => {
    it('should return a book', async () => {
      const result = await service.return('test-id');
      
      expect(result).toEqual(mockLoan);
      expect(prismaService.loan.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        include: { book: true },
      });
      expect(prismaService.book.update).toHaveBeenCalledWith({
        where: { id: 'book-id' },
        data: { status: BookStatus.AVAILABLE },
      });
      expect(prismaService.loan.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: { 
          status: LoanStatus.RETURNED,
          returnedDate: expect.any(Date),
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
          book: true,
        },
      });
    });

    it('should throw an error if the loan is not in BORROWED status', async () => {
      mockPrismaService.loan.findUnique.mockResolvedValueOnce({
        ...mockLoan,
        status: LoanStatus.RETURNED,
      });
      
      await expect(service.return('test-id')).rejects.toThrow(BadRequestException);
    });
  });

  describe('extend', () => {
    it('should extend a loan', async () => {
      const result = await service.extend('test-id');
      
      expect(result).toEqual(mockLoan);
      expect(prismaService.loan.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
      expect(prismaService.loan.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: {
          dueDate: expect.any(Date),
          extensionCount: { increment: 1 },
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
          book: true,
        },
      });
    });

    it('should throw an error if the loan is not in BORROWED status', async () => {
      mockPrismaService.loan.findUnique.mockResolvedValueOnce({
        ...mockLoan,
        status: LoanStatus.RETURNED,
      });
      
      await expect(service.extend('test-id')).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if the loan is overdue', async () => {
      mockPrismaService.loan.findUnique.mockResolvedValueOnce({
        ...mockLoan,
        dueDate: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // 1 day in the past
      });
      
      await expect(service.extend('test-id')).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if the loan has reached the maximum number of extensions', async () => {
      mockPrismaService.loan.findUnique.mockResolvedValueOnce({
        ...mockLoan,
        extensionCount: 2,
      });
      
      await expect(service.extend('test-id')).rejects.toThrow(BadRequestException);
    });
  });

  describe('joinWaitlist', () => {
    beforeEach(() => {
      mockPrismaService.book.findUnique.mockResolvedValueOnce({
        id: 'book-id',
        title: 'Test Book',
        status: BookStatus.ON_LOAN,
      });
    });

    it('should add a user to the waitlist', async () => {
      const joinWaitlistDto = {
        userId: 'user-id',
        bookId: 'book-id',
      };
      
      const result = await service.joinWaitlist(joinWaitlistDto);
      
      expect(result).toEqual({ id: 'waitlist-id', userId: 'user-id', bookId: 'book-id' });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
      });
      expect(prismaService.book.findUnique).toHaveBeenCalledWith({
        where: { id: 'book-id' },
      });
      expect(prismaService.waitlist.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'user-id',
          bookId: 'book-id',
        },
      });
      expect(prismaService.waitlist.create).toHaveBeenCalledWith({
        data: {
          user: { connect: { id: 'user-id' } },
          book: { connect: { id: 'book-id' } },
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
          book: true,
        },
      });
    });

    it('should throw an error if the book is available', async () => {
      mockPrismaService.book.findUnique.mockResolvedValueOnce({
        id: 'book-id',
        title: 'Test Book',
        status: BookStatus.AVAILABLE,
      });
      
      const joinWaitlistDto = {
        userId: 'user-id',
        bookId: 'book-id',
      };
      
      await expect(service.joinWaitlist(joinWaitlistDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if the user is already on the waitlist', async () => {
      mockPrismaService.waitlist.findFirst.mockResolvedValueOnce({
        id: 'waitlist-id',
        userId: 'user-id',
        bookId: 'book-id',
      });
      
      const joinWaitlistDto = {
        userId: 'user-id',
        bookId: 'book-id',
      };
      
      await expect(service.joinWaitlist(joinWaitlistDto)).rejects.toThrow(ConflictException);
    });
  });
});
