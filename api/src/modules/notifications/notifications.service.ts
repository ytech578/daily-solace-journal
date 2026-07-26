import { prisma } from '../../lib/prisma';
import type { NotificationType } from '@prisma/client';

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}

export const notificationsService = {
  async create(input: CreateNotificationInput) {
    return prisma.notification.create({ data: input });
  },

  async listForUser(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  },

  async markRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  },

  async markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  },

  async unreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, read: false } });
  },
};
