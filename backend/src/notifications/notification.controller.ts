import { Controller, Get, Patch, Param, Post, Body, UseGuards, Request } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getUserNotifications(@Request() req) {
    return this.notificationService.getUserNotifications(req.user.id);
  }

  @Get('all')
  async getAllUserNotifications(@Request() req) {
    return this.notificationService.getUserNotifications(req.user.id, { includeRead: true });
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req) {
    // First check if the notification belongs to the user
    const notification = await this.notificationService.getUserNotifications(req.user.id);
    const userOwnsNotification = notification.some(n => n.id === id);
    
    if (!userOwnsNotification) {
      throw new Error('Notification not found or does not belong to user');
    }
    
    return this.notificationService.markAsRead(id);
  }

  @Post('read-all')
  async markAllAsRead(@Request() req) {
    return this.notificationService.markAllAsRead(req.user.id);
  }

  // Admin endpoints
  @Post('send')
  @Roles('ADMIN')
  async sendNotification(
    @Body() data: {
      userId: string;
      type: string;
      title: string;
      message: string;
      resourceId?: string;
      resourceType?: string;
      metadata?: any;
    },
  ) {
    return this.notificationService.createNotification(data);
  }
}
