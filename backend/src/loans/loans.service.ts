import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Loan, Prisma, LoanStatus, BookStatus } from '@prisma/client';

@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.LoanWhereUniqueInput;
    where?: Prisma.LoanWhereInput;
    orderBy?: Prisma.LoanOrderByWithRelationInput;
  }): Promise<Loan[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.loan.findMany({
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
        book: true,
      },
    });
  }

  async findOne(id: string): Promise<Loan | null> {
    return this.prisma.loan.findUnique({
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
        book: true,
      },
    });
  }

  async findByUser(userId: string): Promise<Loan[]> {
    return this.prisma.loan.findMany({
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
        book: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    userId: string;
    bookId: string;
    dueDate?: Date;
  }): Promise<Loan> {
    const { userId, bookId, dueDate } = data;

    // Check if the user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if the book exists and is available
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (book.status !== BookStatus.AVAILABLE) {
      throw new ConflictException(`Book is not available (current status: ${book.status})`);
    }

    // Check if the user has any overdue books
    const overdueLoans = await this.prisma.loan.count({
      where: {
        userId,
        status: LoanStatus.BORROWED,
        dueDate: {
          lt: new Date(),
        },
      },
    });

    if (overdueLoans > 0) {
      throw new BadRequestException('Cannot borrow books while you have overdue loans');
    }

    // Check if the user has reached the maximum number of borrowed books (e.g., 5)
    const activeLoans = await this.prisma.loan.count({
      where: {
        userId,
        status: LoanStatus.BORROWED,
      },
    });

    if (activeLoans >= 5) {
      throw new BadRequestException('Maximum number of borrowed books reached (5)');
    }

    // Set a default due date if not provided (e.g., 14 days from now)
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 14);
    const finalDueDate = dueDate || defaultDueDate;

    // Create the loan and update the book status in a transaction
    return this.prisma.$transaction(async (prisma) => {
      // Update the book status to ON_LOAN
      await prisma.book.update({
        where: { id: bookId },
        data: { status: BookStatus.ON_LOAN },
      });

      // Create the loan
      return prisma.loan.create({
        data: {
          user: { connect: { id: userId } },
          book: { connect: { id: bookId } },
          dueDate: finalDueDate,
          status: LoanStatus.BORROWED,
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
  }

  async return(id: string): Promise<Loan> {
    // Find the loan
    const loan = await this.prisma.loan.findUnique({
      where: { id },
      include: { book: true },
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    // Check if the loan is already returned
    if (loan.status !== LoanStatus.BORROWED) {
      throw new BadRequestException(`Loan is already ${loan.status.toLowerCase()}`);
    }

    // Return the book and update the book status in a transaction
    return this.prisma.$transaction(async (prisma) => {
      // Update the book status to AVAILABLE
      await prisma.book.update({
        where: { id: loan.bookId },
        data: { status: BookStatus.AVAILABLE },
      });

      // Update the loan status to RETURNED
      return prisma.loan.update({
        where: { id },
        data: { 
          status: LoanStatus.RETURNED,
          returnedDate: new Date(),
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
  }

  async extend(id: string, days: number = 7): Promise<Loan> {
    // Find the loan
    const loan = await this.prisma.loan.findUnique({
      where: { id },
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    // Check if the loan is active
    if (loan.status !== LoanStatus.BORROWED) {
      throw new BadRequestException(`Cannot extend a loan with status: ${loan.status}`);
    }

    // Check if the loan is already overdue
    if (new Date(loan.dueDate) < new Date()) {
      throw new BadRequestException('Cannot extend an overdue loan');
    }

    // Check if the loan has already been extended the maximum number of times (e.g., 2)
    if (loan.extensionCount >= 2) {
      throw new BadRequestException('Maximum number of extensions reached (2)');
    }

    // Calculate the new due date
    const newDueDate = new Date(loan.dueDate);
    newDueDate.setDate(newDueDate.getDate() + days);

    // Update the loan with the new due date and increment the extension count
    return this.prisma.loan.update({
      where: { id },
      data: {
        dueDate: newDueDate,
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
  }

  async findOverdue(): Promise<Loan[]> {
    return this.prisma.loan.findMany({
      where: {
        status: LoanStatus.BORROWED,
        dueDate: {
          lt: new Date(),
        },
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
      orderBy: { dueDate: 'asc' },
    });
  }

  async joinWaitlist(data: {
    userId: string;
    bookId: string;
  }): Promise<any> {
    const { userId, bookId } = data;

    // Check if the user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if the book exists
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    // Check if the book is available (no need to join waitlist)
    if (book.status === BookStatus.AVAILABLE) {
      throw new BadRequestException('Book is available, no need to join waitlist');
    }

    // Check if the user is already on the waitlist for this book
    const existingWaitlistEntry = await this.prisma.waitlist.findFirst({
      where: {
        userId,
        bookId,
      },
    });

    if (existingWaitlistEntry) {
      throw new ConflictException('You are already on the waitlist for this book');
    }

    // Add the user to the waitlist
    return this.prisma.waitlist.create({
      data: {
        user: { connect: { id: userId } },
        book: { connect: { id: bookId } },
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
  }

  async getWaitlist(bookId: string): Promise<any[]> {
    return this.prisma.waitlist.findMany({
      where: { bookId },
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
      orderBy: { createdAt: 'asc' },
    });
  }

  async removeFromWaitlist(id: string): Promise<any> {
    return this.prisma.waitlist.delete({
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
        book: true,
      },
    });
  }
}
