import { Controller, Post, Body, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as csv from 'csv-parser';
import * as fs from 'fs';
import { PrismaService } from '../prisma/prisma.service';
import { BookStatus } from '@prisma/client';

@Controller('import')
export class ImportController {
  constructor(private prisma: PrismaService) {}

  @Post('books')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'text/csv') {
          return cb(new BadRequestException('Only CSV files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async importBooks(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const results = [];
    const errors = [];
    let successCount = 0;
    let errorCount = 0;

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync('./uploads')) {
      fs.mkdirSync('./uploads');
    }

    return new Promise((resolve, reject) => {
      fs.createReadStream(file.path)
        .pipe(csv())
        .on('data', async (data) => {
          try {
            // Validate required fields
            if (!data.isbn || !data.title || !data.author) {
              errors.push({
                row: data,
                error: 'Missing required fields (isbn, title, or author)',
              });
              errorCount++;
              return;
            }

            // Check if book already exists
            const existingBook = await this.prisma.book.findFirst({
              where: { isbn: data.isbn },
            });

            if (existingBook) {
              // Update existing book
              const updatedBook = await this.prisma.book.update({
                where: { id: existingBook.id },
                data: {
                  title: data.title,
                  author: data.author,
                  year: data.year ? parseInt(data.year) : null,
                  publisher: data.publisher || null,
                  description: data.description || null,
                },
              });
              results.push({
                action: 'updated',
                book: updatedBook,
              });
            } else {
              // Create new book
              const newBook = await this.prisma.book.create({
                data: {
                  isbn: data.isbn,
                  title: data.title,
                  author: data.author,
                  year: data.year ? parseInt(data.year) : null,
                  publisher: data.publisher || null,
                  description: data.description || null,
                  status: BookStatus.AVAILABLE,
                },
              });
              results.push({
                action: 'created',
                book: newBook,
              });
            }
            successCount++;
          } catch (error) {
            errors.push({
              row: data,
              error: error.message,
            });
            errorCount++;
          }
        })
        .on('end', () => {
          // Delete the temporary file
          fs.unlinkSync(file.path);
          
          resolve({
            success: true,
            message: `Import completed. ${successCount} books processed successfully, ${errorCount} errors.`,
            results,
            errors,
          });
        })
        .on('error', (error) => {
          // Delete the temporary file
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          
          reject({
            success: false,
            message: 'Error processing CSV file',
            error: error.message,
          });
        });
    });
  }
}
