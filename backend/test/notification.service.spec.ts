import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { NotificationType } from '@prisma/client';

describe('NotificationService', () => {
  let service: NotificationService;
  let prismaService: PrismaService;
  let realtimeGateway: RealtimeGateway;

  const mockPrismaService = {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    reservation: {
      findUnique: jest.fn(),
    },
    loan: {
      findUnique: jest.fn(),
    },
    book: {
      findUnique: jest.fn(),
    },
  };

  const mockRealtimeGateway = {
    notifyUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RealtimeGateway, useValue: mockRealtimeGateway },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    prismaService = module.get<PrismaService>(PrismaService);
    realtimeGateway = module.get<RealtimeGateway>(RealtimeGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNotification', () => {
    it('should create a notification and send it via realtime gateway', async () => {
      const notificationData = {
        userId: 'user1',
        type: NotificationType.RESERVATION_CONFIRMATION,
        title: 'Test Notification',
        message: 'This is a test notification',
        resourceId: 'res1',
        resourceType: 'RESERVATION',
      };

      const createdNotification = {
        id: 'notif1',
        ...notificationData,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.notification.create.mockResolvedValue(createdNotification);

      const result = await service.createNotification(notificationData);

      expect(mockPrismaService.notification.create).toHaveBeenCalledWith({
        data: {
          userId: notificationData.userId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          resourceId: notificationData.resourceId,
          resourceType: notificationData.resourceType,
          metadata: null,
          isRead: false,
        },
      });

      expect(mockRealtimeGateway.notifyUser).toHaveBeenCalledWith(
        notificationData.userId,
        createdNotification
      );

      expect(result).toEqual(createdNotification);
    });

    it('should handle errors when creating a notification', async () => {
      const notificationData = {
        userId: 'user1',
        type: NotificationType.RESERVATION_CONFIRMATION,
        title: 'Test Notification',
        message: 'This is a test notification',
      };

      const error = new Error('Database error');
      mockPrismaService.notification.create.mockRejectedValue(error);

      await expect(service.createNotification(notificationData)).rejects.toThrow(error);
    });
  });

  describe('getUserNotifications', () => {
    it('should return unread notifications by default', async () => {
      const userId = 'user1';
      const mockNotifications = [
        {
          id: 'notif1',
          userId,
          type: NotificationType.RESERVATION_CONFIRMATION,
          title: 'Test Notification 1',
          message: 'This is test notification 1',
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.notification.findMany.mockResolvedValue(mockNotifications);

      const result = await service.getUserNotifications(userId);

      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          isRead: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
      });

      expect(result).toEqual(mockNotifications);
    });

    it('should return all notifications when includeRead is true', async () => {
      const userId = 'user1';
      const mockNotifications = [
        {
          id: 'notif1',
          userId,
          type: NotificationType.RESERVATION_CONFIRMATION,
          title: 'Test Notification 1',
          message: 'This is test notification 1',
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'notif2',
          userId,
          type: NotificationType.RESERVATION_CONFIRMATION,
          title: 'Test Notification 2',
          message: 'This is test notification 2',
          isRead: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.notification.findMany.mockResolvedValue(mockNotifications);

      const result = await service.getUserNotifications(userId, { includeRead: true });

      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
      });

      expect(result).toEqual(mockNotifications);
    });

    it('should respect the limit parameter', async () => {
      const userId = 'user1';
      const limit = 10;
      const mockNotifications = [
        {
          id: 'notif1',
          userId,
          type: NotificationType.RESERVATION_CONFIRMATION,
          title: 'Test Notification 1',
          message: 'This is test notification 1',
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.notification.findMany.mockResolvedValue(mockNotifications);

      const result = await service.getUserNotifications(userId, { limit });

      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          isRead: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      });

      expect(result).toEqual(mockNotifications);
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const notificationId = 'notif1';
      const updatedNotification = {
        id: notificationId,
        userId: 'user1',
        type: NotificationType.RESERVATION_CONFIRMATION,
        title: 'Test Notification',
        message: 'This is a test notification',
        isRead: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.notification.update.mockResolvedValue(updatedNotification);

      const result = await service.markAsRead(notificationId);

      expect(mockPrismaService.notification.update).toHaveBeenCalledWith({
        where: { id: notificationId },
        data: { isRead: true },
      });

      expect(result).toEqual(updatedNotification);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications for a user as read', async () => {
      const userId = 'user1';
      const updateResult = { count: 5 };

      mockPrismaService.notification.updateMany.mockResolvedValue(updateResult);

      const result = await service.markAllAsRead(userId);

      expect(mockPrismaService.notification.updateMany).toHaveBeenCalledWith({
        where: { userId, isRead: false },
        data: { isRead: true },
      });

      expect(result).toEqual(updateResult);
    });
  });

  // Additional tests for specific notification types would follow a similar pattern
});
