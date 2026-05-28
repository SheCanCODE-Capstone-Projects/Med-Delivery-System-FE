import { apiClient } from './apiClient';
import type { ApiResponse, NotificationItem } from '@/types/api';

export async function getNotifications(): Promise<NotificationItem[]> {
  const res = await apiClient<ApiResponse<NotificationItem[]>>('/api/notifications');
  return res.data ?? [];
}

export async function getUnreadCount(): Promise<number> {
  const res = await apiClient<ApiResponse<number>>('/api/notifications/unread-count');
  return res.data ?? 0;
}

export async function markRead(id: number): Promise<void> {
  await apiClient<ApiResponse<void>>(`/api/notifications/${id}/read`, { method: 'PUT' });
}

export async function markAllRead(): Promise<void> {
  await apiClient<ApiResponse<void>>('/api/notifications/read-all', { method: 'PUT' });
}
