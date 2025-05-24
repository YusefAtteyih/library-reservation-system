import { PrismaClient, UserRole, BookStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed the database...');

  // Create sample users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@library.com' },
    update: {},
    create: {
      email: 'admin@library.com',
      name: 'Admin User',
      password: await bcrypt.hash('admin123', 10),
      role: UserRole.ADMIN,
    },
  });

  const librarian = await prisma.user.upsert({
    where: { email: 'librarian@library.com' },
    update: {},
    create: {
      email: 'librarian@library.com',
      name: 'Librarian User',
      password: await bcrypt.hash('librarian123', 10),
      role: UserRole.LIBRARIAN,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@library.com' },
    update: {},
    create: {
      email: 'student@library.com',
      name: 'Student User',
      password: await bcrypt.hash('student123', 10),
      role: UserRole.USER,
    },
  });

  // Create sample books
  const books = await Promise.all([
    prisma.book.create({
      data: {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '9780743273565',
        description: 'A story of decadence and excess in the Jazz Age',
        status: BookStatus.AVAILABLE,
      },
    }),
    prisma.book.create({
      data: {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '9780061120084',
        description: 'A powerful story of racial injustice in the American South',
        status: BookStatus.AVAILABLE,
      },
    }),
  ]);

  // Create sample rooms
  const studyRoom = await prisma.room.create({
    data: {
      name: 'Quiet Study Room',
      description: 'Silent study area for individual work',
      capacity: 8,
    },
  });

  const groupRoom = await prisma.room.create({
    data: {
      name: 'Group Study Room A',
      description: 'Collaborative workspace for group projects',
      capacity: 6,
    },
  });

  // Create sample seats
  const seats = await Promise.all([
    prisma.seat.create({
      data: {
        name: 'Desk 1',
        description: 'Window seat with power outlet',
        roomId: studyRoom.id,
      },
    }),
    prisma.seat.create({
      data: {
        name: 'Desk 2',
        description: 'Central table with good lighting',
        roomId: studyRoom.id,
      },
    }),
  ]);

  // Create a sample reservation
  const reservation = await prisma.reservation.create({
    data: {
      userId: student.id,
      seatId: seats[0].id,
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endTime: new Date(Date.now() + 25 * 60 * 60 * 1000), // 1 hour later
      status: 'PENDING',
    },
  });

  console.log('Database seeded successfully!');
  console.log({
    admin: { email: admin.email, password: 'admin123' },
    librarian: { email: librarian.email, password: 'librarian123' },
    student: { email: student.email, password: 'student123' },
    books,
    rooms: [studyRoom, groupRoom],
    seats,
    reservation,
  });
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
