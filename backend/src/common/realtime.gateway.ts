import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  OnGatewayConnection, 
  OnGatewayDisconnect 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RealtimeGateway.name);
  
  constructor(private prisma: PrismaService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, roomId: string) {
    client.join(`room-${roomId}`);
    this.logger.log(`Client ${client.id} joined room-${roomId}`);
    return { event: 'joinedRoom', data: { roomId } };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, roomId: string) {
    client.leave(`room-${roomId}`);
    this.logger.log(`Client ${client.id} left room-${roomId}`);
    return { event: 'leftRoom', data: { roomId } };
  }

  // Method to broadcast room availability updates
  async broadcastRoomAvailability(roomId: string) {
    try {
      // Get current reservations for the room
      const reservations = await this.prisma.reservation.findMany({
        where: {
          resourceId: roomId,
          resourceType: 'ROOM',
          status: {
            in: ['APPROVED', 'CHECKED_IN'],
          },
          date: {
            gte: new Date(),
          },
        },
        select: {
          id: true,
          date: true,
          startTime: true,
          endTime: true,
          status: true,
        },
      });

      // Broadcast to all clients in the room
      this.server.to(`room-${roomId}`).emit('roomAvailabilityUpdate', {
        roomId,
        reservations,
        updatedAt: new Date(),
      });

      this.logger.log(`Broadcasted availability update for room-${roomId}`);
    } catch (error) {
      this.logger.error(`Error broadcasting room availability: ${error.message}`);
    }
  }

  // Method to broadcast seat availability updates
  async broadcastSeatAvailability(seatId: string) {
    try {
      // Get current reservations for the seat
      const reservations = await this.prisma.reservation.findMany({
        where: {
          resourceId: seatId,
          resourceType: 'SEAT',
          status: {
            in: ['APPROVED', 'CHECKED_IN'],
          },
          date: {
            gte: new Date(),
          },
        },
        select: {
          id: true,
          date: true,
          startTime: true,
          endTime: true,
          status: true,
        },
      });

      // Broadcast to all clients interested in this seat
      this.server.to(`seat-${seatId}`).emit('seatAvailabilityUpdate', {
        seatId,
        reservations,
        updatedAt: new Date(),
      });

      this.logger.log(`Broadcasted availability update for seat-${seatId}`);
    } catch (error) {
      this.logger.error(`Error broadcasting seat availability: ${error.message}`);
    }
  }

  // Method to broadcast global occupancy updates to admin dashboard
  async broadcastOccupancyUpdate() {
    try {
      // Get current occupancy data
      const rooms = await this.prisma.room.findMany({
        include: {
          seats: {
            include: {
              reservations: {
                where: {
                  status: 'CHECKED_IN',
                  date: new Date(),
                },
              },
            },
          },
          reservations: {
            where: {
              status: 'CHECKED_IN',
              date: new Date(),
            },
          },
        },
      });

      // Calculate occupancy statistics
      const occupancyData = {
        totalRooms: rooms.length,
        occupiedRooms: rooms.filter(room => room.reservations.length > 0).length,
        totalSeats: rooms.reduce((acc, room) => acc + room.seats.length, 0),
        occupiedSeats: rooms.reduce((acc, room) => 
          acc + room.seats.filter(seat => seat.reservations.length > 0).length, 0),
        updatedAt: new Date(),
      };

      // Broadcast to admin channel
      this.server.to('admin-dashboard').emit('occupancyUpdate', occupancyData);
      this.logger.log('Broadcasted occupancy update to admin dashboard');
    } catch (error) {
      this.logger.error(`Error broadcasting occupancy update: ${error.message}`);
    }
  }

  // Method to notify users about their reservations
  async notifyUser(userId: string, notification: any) {
    this.server.to(`user-${userId}`).emit('notification', notification);
    this.logger.log(`Sent notification to user-${userId}`);
  }
}
