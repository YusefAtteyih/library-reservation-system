import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { LoanStatus, BookStatus } from '@prisma/client';

describe('Loan Workflow (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  
  // Test data
  let userId: string;
  let bookId: string;
  let loanId: string;
  let waitlistId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();
    
    // Set up test data
    const user = await prismaService.user.create({
      data: {
        email: 'test-loan-user@example.com',
        name: 'Test Loan User',
        universityId: 'LOAN123',
        role: 'STUDENT',
      },
    });
    userId = user.id;
    
    const book = await prismaService.book.create({
      data: {
        isbn: '9781234567890',
        title: 'Test Book for Loans',
        author: 'Test Author',
        year: 2023,
        status: BookStatus.AVAILABLE,
      },
    });
    bookId = book.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prismaService.waitlist.deleteMany({
      where: { userId },
    });
    await prismaService.loan.deleteMany({
      where: { userId },
    });
    await prismaService.book.delete({
      where: { id: bookId },
    });
    await prismaService.user.delete({
      where: { id: userId },
    });
    
    await app.close();
  });

  it('should borrow a book', async () => {
    const response = await request(app.getHttpServer())
      .post('/loans')
      .send({
        userId,
        bookId,
      })
      .expect(201);
    
    expect(response.body).toBeDefined();
    expect(response.body.userId).toBe(userId);
    expect(response.body.bookId).toBe(bookId);
    expect(response.body.status).toBe(LoanStatus.BORROWED);
    expect(response.body.dueDate).toBeDefined();
    
    loanId = response.body.id;
    
    // Verify book status was updated
    const book = await prismaService.book.findUnique({
      where: { id: bookId },
    });
    expect(book.status).toBe(BookStatus.ON_LOAN);
  });

  it('should not allow borrowing a book that is already on loan', async () => {
    // Create another user
    const anotherUser = await prismaService.user.create({
      data: {
        email: 'another-user@example.com',
        name: 'Another User',
        universityId: 'ANOTHER123',
        role: 'STUDENT',
      },
    });
    
    await request(app.getHttpServer())
      .post('/loans')
      .send({
        userId: anotherUser.id,
        bookId,
      })
      .expect(409); // Conflict
    
    // Clean up
    await prismaService.user.delete({
      where: { id: anotherUser.id },
    });
  });

  it('should extend a loan', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/loans/${loanId}/extend`)
      .send({
        days: 7,
      })
      .expect(200);
    
    expect(response.body).toBeDefined();
    expect(response.body.id).toBe(loanId);
    expect(response.body.extensionCount).toBe(1);
    
    // Original due date should be extended
    const originalLoan = await prismaService.loan.findUnique({
      where: { id: loanId },
    });
    const extendedDueDate = new Date(response.body.dueDate);
    const originalDueDate = new Date(originalLoan.dueDate);
    
    // The extended due date should be later than the original
    expect(extendedDueDate.getTime()).toBeGreaterThan(originalDueDate.getTime());
  });

  it('should join a waitlist for a book', async () => {
    // Create another user
    const waitlistUser = await prismaService.user.create({
      data: {
        email: 'waitlist-user@example.com',
        name: 'Waitlist User',
        universityId: 'WAIT123',
        role: 'STUDENT',
      },
    });
    
    const response = await request(app.getHttpServer())
      .post('/loans/waitlist')
      .send({
        userId: waitlistUser.id,
        bookId,
      })
      .expect(201);
    
    expect(response.body).toBeDefined();
    expect(response.body.userId).toBe(waitlistUser.id);
    expect(response.body.bookId).toBe(bookId);
    
    waitlistId = response.body.id;
    
    // Clean up
    await prismaService.user.delete({
      where: { id: waitlistUser.id },
    });
  });

  it('should get the waitlist for a book', async () => {
    const response = await request(app.getHttpServer())
      .get(`/loans/waitlist/${bookId}`)
      .expect(200);
    
    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body)).toBe(true);
    
    // Remove the waitlist entry to clean up
    await prismaService.waitlist.delete({
      where: { id: waitlistId },
    });
  });

  it('should return a book', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/loans/${loanId}/return`)
      .expect(200);
    
    expect(response.body).toBeDefined();
    expect(response.body.id).toBe(loanId);
    expect(response.body.status).toBe(LoanStatus.RETURNED);
    expect(response.body.returnedDate).toBeDefined();
    
    // Verify book status was updated
    const book = await prismaService.book.findUnique({
      where: { id: bookId },
    });
    expect(book.status).toBe(BookStatus.AVAILABLE);
  });

  it('should get all loans for a user', async () => {
    const response = await request(app.getHttpServer())
      .get(`/loans/user/${userId}`)
      .expect(200);
    
    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].userId).toBe(userId);
  });

  it('should get overdue loans', async () => {
    // Create an overdue loan
    const overdueBook = await prismaService.book.create({
      data: {
        isbn: '9780987654321',
        title: 'Overdue Test Book',
        author: 'Overdue Author',
        year: 2022,
        status: BookStatus.AVAILABLE,
      },
    });
    
    // Set due date in the past
    const pastDueDate = new Date();
    pastDueDate.setDate(pastDueDate.getDate() - 7); // 7 days ago
    
    await prismaService.loan.create({
      data: {
        userId,
        bookId: overdueBook.id,
        dueDate: pastDueDate,
        status: LoanStatus.BORROWED,
      },
    });
    
    // Update book status
    await prismaService.book.update({
      where: { id: overdueBook.id },
      data: { status: BookStatus.ON_LOAN },
    });
    
    const response = await request(app.getHttpServer())
      .get('/loans/overdue')
      .expect(200);
    
    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    
    // Clean up
    await prismaService.loan.deleteMany({
      where: { bookId: overdueBook.id },
    });
    await prismaService.book.delete({
      where: { id: overdueBook.id },
    });
  });
});
