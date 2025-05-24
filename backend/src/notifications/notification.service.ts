import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { NotificationType, User } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private realtimeGateway: RealtimeGateway,
  ) {}

  /**
   * Create a notification and send it to the user
   */
  async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    resourceId?: string;
    resourceType?: string;
    metadata?: any;
  }) {
    try {
      // Create notification in database
      const notification = await this.prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          resourceId: data.resourceId,
          resourceType: data.resourceType,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
          isRead: false,
        },
      });

      // Send real-time notification if available
      if (this.realtimeGateway) {
        this.realtimeGateway.notifyUser(data.userId, notification);
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get all notifications for a user
   */
  async getUserNotifications(userId: string, options?: { limit?: number; includeRead?: boolean }) {
    const { limit = 50, includeRead = false } = options || {};

    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(includeRead ? {} : { isRead: false }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  /**
   * Mark all notifications for a user as read
   */
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  /**
   * Send reservation confirmation notification
   */
  async sendReservationConfirmation(userId: string, reservationId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        room: { select: { name: true } },
        seat: { select: { label: true } },
      },
    });

    if (!reservation) {
      throw new Error(`Reservation with ID ${reservationId} not found`);
    }

    const resourceName = reservation.room 
      ? reservation.room.name 
      : reservation.seat 
        ? reservation.seat.label 
        : 'Unknown';

    const date = new Date(reservation.date).toLocaleDateString();
    
    return this.createNotification({
      userId,
      type: NotificationType.RESERVATION_CONFIRMATION,
      title: 'Reservation Confirmed',
      message: `Your reservation for ${resourceName} on ${date} from ${reservation.startTime} to ${reservation.endTime} has been confirmed.`,
      resourceId: reservationId,
      resourceType: 'RESERVATION',
      metadata: {
        reservationId,
        date: reservation.date,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        resourceName,
      },
    });
  }

  /**
   * Send reservation reminder notification (24 hours before)
   */
  async sendReservationReminder(userId: string, reservationId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        room: { select: { name: true } },
        seat: { select: { label: true } },
      },
    });

    if (!reservation) {
      throw new Error(`Reservation with ID ${reservationId} not found`);
    }

    const resourceName = reservation.room 
      ? reservation.room.name 
      : reservation.seat 
        ? reservation.seat.label 
        : 'Unknown';

    const date = new Date(reservation.date).toLocaleDateString();
    
    return this.createNotification({
      userId,
      type: NotificationType.RESERVATION_REMINDER,
      title: 'Upcoming Reservation',
      message: `Reminder: You have a reservation for ${resourceName} tomorrow (${date}) from ${reservation.startTime} to ${reservation.endTime}.`,
      resourceId: reservationId,
      resourceType: 'RESERVATION',
      metadata: {
        reservationId,
        date: reservation.date,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        resourceName,
      },
    });
  }

  /**
   * Send check-in reminder notification (15 minutes before)
   */
  async sendCheckInReminder(userId: string, reservationId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        room: { select: { name: true } },
        seat: { select: { label: true } },
      },
    });

    if (!reservation) {
      throw new Error(`Reservation with ID ${reservationId} not found`);
    }

    const resourceName = reservation.room 
      ? reservation.room.name 
      : reservation.seat 
        ? reservation.seat.label 
        : 'Unknown';

    return this.createNotification({
      userId,
      type: NotificationType.CHECK_IN_REMINDER,
      title: 'Check-in Required Soon',
      message: `Your reservation for ${resourceName} starts in 15 minutes. Please check in within 15 minutes of the start time to avoid losing your reservation.`,
      resourceId: reservationId,
      resourceType: 'RESERVATION',
      metadata: {
        reservationId,
        date: reservation.date,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        resourceName,
        checkInDeadline: 15, // minutes
      },
    });
  }

  /**
   * Send book due reminder notification
   */
  async sendBookDueReminder(userId: string, loanId: string) {
    const loan = await this.prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        book: { select: { title: true, author: true } },
      },
    });

    if (!loan) {
      throw new Error(`Loan with ID ${loanId} not found`);
    }

    const dueDate = new Date(loan.dueDate).toLocaleDateString();
    
    return this.createNotification({
      userId,
      type: NotificationType.BOOK_DUE_REMINDER,
      title: 'Book Due Soon',
      message: `The book "${loan.book.title}" by ${loan.book.author} is due to be returned by ${dueDate}.`,
      resourceId: loanId,
      resourceType: 'LOAN',
      metadata: {
        loanId,
        bookId: loan.bookId,
        bookTitle: loan.book.title,
        dueDate: loan.dueDate,
      },
    });
  }

  /**
   * Send book overdue notification
   */
  async sendBookOverdueNotification(userId: string, loanId: string) {
    const loan = await this.prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        book: { select: { title: true, author: true } },
      },
    });

    if (!loan) {
      throw new Error(`Loan with ID ${loanId} not found`);
    }

    const dueDate = new Date(loan.dueDate).toLocaleDateString();
    const daysOverdue = Math.floor((Date.now() - new Date(loan.dueDate).getTime()) / (1000 * 60 * 60 * 24));
    
    return this.createNotification({
      userId,
      type: NotificationType.BOOK_OVERDUE,
      title: 'Book Overdue',
      message: `The book "${loan.book.title}" by ${loan.book.author} is overdue by ${daysOverdue} days. Please return it as soon as possible.`,
      resourceId: loanId,
      resourceType: 'LOAN',
      metadata: {
        loanId,
        bookId: loan.bookId,
        bookTitle: loan.book.title,
        dueDate: loan.dueDate,
        daysOverdue,
      },
    });
  }

  /**
   * Send waitlist notification when a book becomes available
   */
  async sendWaitlistNotification(userId: string, bookId: string) {
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new Error(`Book with ID ${bookId} not found`);
    }
    
    return this.createNotification({
      userId,
      type: NotificationType.WAITLIST_AVAILABLE,
      title: 'Book Available',
      message: `Good news! The book "${book.title}" by ${book.author} is now available. You have 24 hours to borrow it before it's offered to the next person in line.`,
      resourceId: bookId,
      resourceType: 'BOOK',
      metadata: {
        bookId,
        bookTitle: book.title,
        bookAuthor: book.author,
        availableUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      },
    });
  }

  /**
   * Send admin notification for pending approval
   */
  async sendPendingApprovalNotification(adminId: string, reservationId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        user: { select: { name: true } },
        room: { select: { name: true } },
        seat: { select: { label: true } },
      },
    });

    if (!reservation) {
      throw new Error(`Reservation with ID ${reservationId} not found`);
    }

    const resourceName = reservation.room 
      ? reservation.room.name 
      : reservation.seat 
        ? reservation.seat.label 
        : 'Unknown';

    const date = new Date(reservation.date).toLocaleDateString();
    
    return this.createNotification({
      userId: adminId,
      type: NotificationType.PENDING_APPROVAL,
      title: 'Reservation Needs Approval',
      message: `${reservation.user.name} has requested to reserve ${resourceName} on ${date} from ${reservation.startTime} to ${reservation.endTime}.`,
      resourceId: reservationId,
      resourceType: 'RESERVATION',
      metadata: {
        reservationId,
        userId: reservation.userId,
        userName: reservation.user.name,
        date: reservation.date,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        resourceName,
      },
    });
  }
}
