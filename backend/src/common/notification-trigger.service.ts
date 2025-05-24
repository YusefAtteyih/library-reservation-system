import { Injectable } from '@nestjs/common';
import { ReservationService } from '../reservations/reservations.service';
import { LoanService } from '../loans/loans.service';
import { NotificationService } from './notification.service';
import { ReservationStatus, LoanStatus } from '@prisma/client';

@Injectable()
export class NotificationTriggerService {
  constructor(
    private reservationService: ReservationService,
    private loanService: LoanService,
    private notificationService: NotificationService,
  ) {}

  /**
   * Trigger notification when a reservation is created
   */
  async onReservationCreated(reservationId: string) {
    const reservation = await this.reservationService.findOne(reservationId);
    
    if (!reservation) {
      throw new Error(`Reservation with ID ${reservationId} not found`);
    }
    
    // If auto-approval is disabled, notify admins about pending approval
    if (reservation.status === ReservationStatus.PENDING) {
      // Get all admin users
      const admins = await this.getAdminUsers();
      
      // Notify each admin
      for (const admin of admins) {
        await this.notificationService.sendPendingApprovalNotification(
          admin.id,
          reservationId,
        );
      }
    }
    
    // If auto-approval is enabled, send confirmation to user
    if (reservation.status === ReservationStatus.APPROVED) {
      await this.notificationService.sendReservationConfirmation(
        reservation.userId,
        reservationId,
      );
    }
  }

  /**
   * Trigger notification when a reservation is approved
   */
  async onReservationApproved(reservationId: string) {
    const reservation = await this.reservationService.findOne(reservationId);
    
    if (!reservation) {
      throw new Error(`Reservation with ID ${reservationId} not found`);
    }
    
    await this.notificationService.sendReservationConfirmation(
      reservation.userId,
      reservationId,
    );
  }

  /**
   * Trigger notification when a reservation is rejected
   */
  async onReservationRejected(reservationId: string, reason: string) {
    const reservation = await this.reservationService.findOne(reservationId);
    
    if (!reservation) {
      throw new Error(`Reservation with ID ${reservationId} not found`);
    }
    
    await this.notificationService.createNotification({
      userId: reservation.userId,
      type: 'RESERVATION_REJECTED',
      title: 'Reservation Rejected',
      message: `Your reservation request has been rejected. ${reason ? `Reason: ${reason}` : ''}`,
      resourceId: reservationId,
      resourceType: 'RESERVATION',
      metadata: {
        reservationId,
        reason,
      },
    });
  }

  /**
   * Trigger notification when a reservation is canceled
   */
  async onReservationCanceled(reservationId: string, canceledByAdmin: boolean) {
    const reservation = await this.reservationService.findOne(reservationId);
    
    if (!reservation) {
      throw new Error(`Reservation with ID ${reservationId} not found`);
    }
    
    await this.notificationService.createNotification({
      userId: reservation.userId,
      type: 'RESERVATION_CANCELED',
      title: 'Reservation Canceled',
      message: canceledByAdmin 
        ? 'Your reservation has been canceled by an administrator.' 
        : 'Your reservation has been canceled successfully.',
      resourceId: reservationId,
      resourceType: 'RESERVATION',
      metadata: {
        reservationId,
        canceledByAdmin,
      },
    });
  }

  /**
   * Trigger notification when a user checks in
   */
  async onCheckIn(reservationId: string) {
    const reservation = await this.reservationService.findOne(reservationId);
    
    if (!reservation) {
      throw new Error(`Reservation with ID ${reservationId} not found`);
    }
    
    await this.notificationService.createNotification({
      userId: reservation.userId,
      type: 'CHECK_IN_CONFIRMATION',
      title: 'Check-in Successful',
      message: 'You have successfully checked in to your reservation.',
      resourceId: reservationId,
      resourceType: 'RESERVATION',
      metadata: {
        reservationId,
        checkedInAt: new Date(),
      },
    });
  }

  /**
   * Trigger notification when a reservation is about to expire
   */
  async onReservationExpiringSoon(reservationId: string) {
    const reservation = await this.reservationService.findOne(reservationId);
    
    if (!reservation) {
      throw new Error(`Reservation with ID ${reservationId} not found`);
    }
    
    await this.notificationService.createNotification({
      userId: reservation.userId,
      type: 'RESERVATION_EXPIRING',
      title: 'Reservation Ending Soon',
      message: 'Your reservation will end in 15 minutes.',
      resourceId: reservationId,
      resourceType: 'RESERVATION',
      metadata: {
        reservationId,
        expiresAt: reservation.endTime,
      },
    });
  }

  /**
   * Trigger notification when a book is borrowed
   */
  async onBookBorrowed(loanId: string) {
    const loan = await this.loanService.findOne(loanId);
    
    if (!loan) {
      throw new Error(`Loan with ID ${loanId} not found`);
    }
    
    await this.notificationService.createNotification({
      userId: loan.userId,
      type: 'BOOK_BORROWED',
      title: 'Book Borrowed',
      message: `You have successfully borrowed "${loan.book.title}". It is due on ${new Date(loan.dueDate).toLocaleDateString()}.`,
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
   * Trigger notification when a book is returned
   */
  async onBookReturned(loanId: string) {
    const loan = await this.loanService.findOne(loanId);
    
    if (!loan) {
      throw new Error(`Loan with ID ${loanId} not found`);
    }
    
    await this.notificationService.createNotification({
      userId: loan.userId,
      type: 'BOOK_RETURNED',
      title: 'Book Returned',
      message: `You have successfully returned "${loan.book.title}".`,
      resourceId: loanId,
      resourceType: 'LOAN',
      metadata: {
        loanId,
        bookId: loan.bookId,
        bookTitle: loan.book.title,
        returnedAt: new Date(),
      },
    });
  }

  /**
   * Trigger notification when a loan is extended
   */
  async onLoanExtended(loanId: string) {
    const loan = await this.loanService.findOne(loanId);
    
    if (!loan) {
      throw new Error(`Loan with ID ${loanId} not found`);
    }
    
    await this.notificationService.createNotification({
      userId: loan.userId,
      type: 'LOAN_EXTENDED',
      title: 'Loan Extended',
      message: `Your loan for "${loan.book.title}" has been extended. The new due date is ${new Date(loan.dueDate).toLocaleDateString()}.`,
      resourceId: loanId,
      resourceType: 'LOAN',
      metadata: {
        loanId,
        bookId: loan.bookId,
        bookTitle: loan.book.title,
        newDueDate: loan.dueDate,
      },
    });
  }

  /**
   * Helper method to get all admin users
   */
  private async getAdminUsers() {
    // This would be implemented to fetch all admin users from the database
    // For now, we'll return a mock admin
    return [
      { id: 'admin1', name: 'Admin User', email: 'admin@example.com', role: 'ADMIN' }
    ];
  }
}
