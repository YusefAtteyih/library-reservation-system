import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from './notification.service';
import { ReservationStatus, LoanStatus } from '@prisma/client';

@Injectable()
export class NotificationSchedulerService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  // Run every hour to send reservation reminders (24 hours before)
  @Cron(CronExpression.EVERY_HOUR)
  async sendReservationReminders() {
    try {
      // Get all approved reservations that are 24 hours away
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
      
      const reservations = await this.prisma.reservation.findMany({
        where: {
          status: ReservationStatus.APPROVED,
          date: {
            gte: tomorrow,
            lt: dayAfterTomorrow,
          },
        },
      });
      
      // Send reminder for each reservation
      for (const reservation of reservations) {
        await this.notificationService.sendReservationReminder(
          reservation.userId,
          reservation.id,
        );
      }
      
      console.log(`Sent ${reservations.length} reservation reminders`);
    } catch (error) {
      console.error('Error sending reservation reminders:', error);
    }
  }
  
  // Run every 5 minutes to send check-in reminders (15 minutes before)
  @Cron(CronExpression.EVERY_5_MINUTES)
  async sendCheckInReminders() {
    try {
      // Get current time
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Calculate time 15 minutes from now (for matching start times)
      const fifteenMinutesFromNow = new Date(now);
      fifteenMinutesFromNow.setMinutes(currentMinute + 15);
      const targetHour = fifteenMinutesFromNow.getHours();
      const targetMinute = fifteenMinutesFromNow.getMinutes();
      
      // Format target time as HH:MM for comparison with startTime
      const targetTimeString = `${targetHour.toString().padStart(2, '0')}:${targetMinute.toString().padStart(2, '0')}`;
      
      // Get all approved reservations for today with start time 15 minutes from now
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const reservations = await this.prisma.reservation.findMany({
        where: {
          status: ReservationStatus.APPROVED,
          date: {
            gte: today,
            lt: tomorrow,
          },
          startTime: {
            startsWith: targetTimeString.substring(0, 5),
          },
        },
      });
      
      // Send check-in reminder for each reservation
      for (const reservation of reservations) {
        await this.notificationService.sendCheckInReminder(
          reservation.userId,
          reservation.id,
        );
      }
      
      console.log(`Sent ${reservations.length} check-in reminders`);
    } catch (error) {
      console.error('Error sending check-in reminders:', error);
    }
  }
  
  // Run every day at midnight to send book due reminders (3 days before)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async sendBookDueReminders() {
    try {
      // Calculate date 3 days from now
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      threeDaysFromNow.setHours(23, 59, 59, 999);
      
      const fourDaysFromNow = new Date(threeDaysFromNow);
      fourDaysFromNow.setDate(fourDaysFromNow.getDate() + 1);
      
      // Get all active loans due in 3 days
      const loans = await this.prisma.loan.findMany({
        where: {
          status: LoanStatus.ACTIVE,
          dueDate: {
            gte: threeDaysFromNow,
            lt: fourDaysFromNow,
          },
        },
      });
      
      // Send due reminder for each loan
      for (const loan of loans) {
        await this.notificationService.sendBookDueReminder(
          loan.userId,
          loan.id,
        );
      }
      
      console.log(`Sent ${loans.length} book due reminders`);
    } catch (error) {
      console.error('Error sending book due reminders:', error);
    }
  }
  
  // Run every day at 9 AM to send overdue notifications
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendOverdueNotifications() {
    try {
      // Get current date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get all active loans that are overdue
      const overdueLoans = await this.prisma.loan.findMany({
        where: {
          status: LoanStatus.ACTIVE,
          dueDate: {
            lt: today,
          },
        },
      });
      
      // Send overdue notification for each loan
      for (const loan of overdueLoans) {
        await this.notificationService.sendBookOverdueNotification(
          loan.userId,
          loan.id,
        );
      }
      
      console.log(`Sent ${overdueLoans.length} book overdue notifications`);
    } catch (error) {
      console.error('Error sending overdue notifications:', error);
    }
  }
  
  // Run every hour to process waitlist notifications when books become available
  @Cron(CronExpression.EVERY_HOUR)
  async processWaitlistNotifications() {
    try {
      // Get all books that have recently become available
      const recentlyAvailableBooks = await this.prisma.book.findMany({
        where: {
          status: 'AVAILABLE',
          // Only consider books that have waitlist entries
          waitlist: {
            some: {
              notified: false,
            },
          },
        },
        include: {
          waitlist: {
            where: {
              notified: false,
            },
            orderBy: {
              createdAt: 'asc',
            },
            take: 1,
          },
        },
      });
      
      // Process each book with waitlist entries
      for (const book of recentlyAvailableBooks) {
        if (book.waitlist.length > 0) {
          const waitlistEntry = book.waitlist[0];
          
          // Send notification to the first person in waitlist
          await this.notificationService.sendWaitlistNotification(
            waitlistEntry.userId,
            book.id,
          );
          
          // Mark the waitlist entry as notified
          await this.prisma.waitlistEntry.update({
            where: { id: waitlistEntry.id },
            data: { 
              notified: true,
              notifiedAt: new Date(),
            },
          });
          
          console.log(`Notified user ${waitlistEntry.userId} about available book ${book.id}`);
        }
      }
    } catch (error) {
      console.error('Error processing waitlist notifications:', error);
    }
  }
}
