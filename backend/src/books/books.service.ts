import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Book, Prisma, BookStatus } from '@prisma/client';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.BookWhereUniqueInput;
    where?: Prisma.BookWhereInput;
    orderBy?: Prisma.BookOrderByWithRelationInput;
  }): Promise<Book[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.book.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async findOne(id: string): Promise<Book | null> {
    return this.prisma.book.findUnique({
      where: { id },
      include: {
        loans: true,
      },
    });
  }

  async create(data: Prisma.BookCreateInput): Promise<Book> {
    return this.prisma.book.create({
      data,
    });
  }

  async update(id: string, data: Prisma.BookUpdateInput): Promise<Book> {
    return this.prisma.book.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<Book> {
    return this.prisma.book.delete({
      where: { id },
    });
  }

  async search(query: string): Promise<Book[]> {
    return this.prisma.book.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { author: { contains: query, mode: 'insensitive' } },
          { isbn: { contains: query } },
        ],
      },
      orderBy: { title: 'asc' },
    });
  }

  async updateStatus(id: string, status: BookStatus): Promise<Book> {
    return this.prisma.book.update({
      where: { id },
      data: { status },
    });
  }
}
