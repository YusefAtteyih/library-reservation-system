import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed data creation...');

  // Clean up existing data (in reverse order of dependencies)
  console.log('Cleaning up existing data...');
  await prisma.notification.deleteMany({});
  await prisma.loan.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.timeslot.deleteMany({});
  await prisma.seat.deleteMany({});
  await prisma.book.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.user.deleteMany({});

  // Create sample users
  console.log('Creating sample users...');
  const adminUser = await prisma.user.create({
    data: {
      universityId: 'ADMIN001',
      role: Role.ADMIN,
      email: 'admin@bahcesehir.edu.tr',
      name: 'Library Administrator',
    },
  });

  const studentUsers = await Promise.all([
    prisma.user.create({
      data: {
        universityId: 'STU001',
        role: Role.STUDENT,
        email: 'student1@bahcesehir.edu.tr',
        name: 'Ahmet Yılmaz',
      },
    }),
    prisma.user.create({
      data: {
        universityId: 'STU002',
        role: Role.STUDENT,
        email: 'student2@bahcesehir.edu.tr',
        name: 'Ayşe Kaya',
      },
    }),
    prisma.user.create({
      data: {
        universityId: 'STU003',
        role: Role.STUDENT,
        email: 'student3@bahcesehir.edu.tr',
        name: 'Mehmet Demir',
      },
    }),
  ]);

  // Create sample rooms
  console.log('Creating sample rooms...');
  const rooms = await Promise.all([
    prisma.room.create({
      data: {
        name: 'Study Room A',
        location: 'Library 1st Floor',
        capacity: 8,
      },
    }),
    prisma.room.create({
      data: {
        name: 'Study Room B',
        location: 'Library 1st Floor',
        capacity: 6,
      },
    }),
    prisma.room.create({
      data: {
        name: 'Conference Room',
        location: 'Library 2nd Floor',
        capacity: 20,
      },
    }),
    prisma.room.create({
      data: {
        name: 'Quiet Study Area',
        location: 'Library 3rd Floor',
        capacity: 30,
      },
    }),
  ]);

  // Create sample seats
  console.log('Creating sample seats...');
  
  // Seats in Study Room A
  const seatsRoomA = await Promise.all(
    Array.from({ length: 8 }, (_, i) =>
      prisma.seat.create({
        data: {
          roomId: rooms[0].id,
          label: `A${i + 1}`,
        },
      })
    )
  );

  // Seats in Study Room B
  const seatsRoomB = await Promise.all(
    Array.from({ length: 6 }, (_, i) =>
      prisma.seat.create({
        data: {
          roomId: rooms[1].id,
          label: `B${i + 1}`,
        },
      })
    )
  );

  // Seats in Conference Room
  const seatsConference = await Promise.all(
    Array.from({ length: 20 }, (_, i) =>
      prisma.seat.create({
        data: {
          roomId: rooms[2].id,
          label: `C${i + 1}`,
        },
      })
    )
  );

  // Seats in Quiet Study Area
  const seatsQuietArea = await Promise.all(
    Array.from({ length: 30 }, (_, i) =>
      prisma.seat.create({
        data: {
          roomId: rooms[3].id,
          label: `Q${i + 1}`,
        },
      })
    )
  );

  // Independent seats in open reading area
  const independentSeats = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      prisma.seat.create({
        data: {
          label: `Open Area ${i + 1}`,
        },
      })
    )
  );

  // Create sample books
  console.log('Creating sample books...');
  const books = await Promise.all([
    prisma.book.create({
      data: {
        isbn: '9780262033848',
        title: 'Introduction to Algorithms',
        author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
        year: 2009,
      },
    }),
    prisma.book.create({
      data: {
        isbn: '9780134685991',
        title: 'Effective Java',
        author: 'Joshua Bloch',
        year: 2018,
      },
    }),
    prisma.book.create({
      data: {
        isbn: '9780132350884',
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin',
        year: 2008,
      },
    }),
    prisma.book.create({
      data: {
        isbn: '9780201633610',
        title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
        author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
        year: 1994,
      },
    }),
    prisma.book.create({
      data: {
        isbn: '9781449331818',
        title: 'Learning JavaScript Design Patterns',
        author: 'Addy Osmani',
        year: 2012,
      },
    }),
  ]);

  // Create sample timeslots for today and next 7 days
  console.log('Creating sample timeslots...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() + dayOffset);

    // Create timeslots for each room (9 AM to 5 PM, 1-hour slots)
    for (const room of rooms) {
      for (let hour = 9; hour < 17; hour++) {
        const startAt = new Date(currentDate);
        startAt.setHours(hour, 0, 0, 0);
        
        const endAt = new Date(currentDate);
        endAt.setHours(hour + 1, 0, 0, 0);

        await prisma.timeslot.create({
          data: {
            roomId: room.id,
            startAt,
            endAt,
            isBlocked: false, // Default all slots to available
          },
        });
      }
    }
  }

  console.log('Seed data creation completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
