import { api } from './axios';
import type { ApiPaginated } from '@/types/api';

export type NotificationType =
  | 'low_stock'
  | 'out_of_stock'
  | 'po_received'
  | 'user_invited'
  | 'invitation_accepted'
  | 'invoice_overdue'
  | 'sale_voided'
  | 'system';

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'danger';

export interface AppNotification {
  _id: string;
  tenantId: string;
  userId: string | null;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  detail: string;
  source: string;
  refType: string | null;
  refId: string | null;
  readAt: string | null;
  snoozedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSummary {
  total: number;
  unread: number;
  danger: number;
  warning: number;
  success: number;
  info: number;
}

export interface ListNotificationsParams {
  page?: number;
  limit?: number;
  filter?: 'all' | 'unread' | NotificationSeverity;
  search?: string;
}

export const notificationApi = {
  list: (params: ListNotificationsParams = {}) =>
    api
      .get<ApiPaginated<AppNotification>>('/client/notifications', { params })
      .then((r) => r.data),

  unreadCount: () =>
    api
      .get<{ data: { count: number } }>('/client/notifications/unread-count')
      .then((r) => r.data.data),

  summary: () =>
    api
      .get<{ data: NotificationSummary }>('/client/notifications/summary')
      .then((r) => r.data.data),

  markRead: (id: string) =>
    api
      .post<{ data: AppNotification }>(`/client/notifications/${id}/read`)
      .then((r) => r.data.data),

  markAllRead: () =>
    api
      .post<{ data: { modified: number } }>('/client/notifications/read-all')
      .then((r) => r.data.data),

  snooze: (id: string) =>
    api
      .post<{ data: AppNotification }>(`/client/notifications/${id}/snooze`)
      .then((r) => r.data.data),

  unsnooze: (id: string) =>
    api
      .post<{ data: AppNotification }>(`/client/notifications/${id}/unsnooze`)
      .then((r) => r.data.data),

  archive: (id: string) =>
    api
      .post<{ data: AppNotification }>(`/client/notifications/${id}/archive`)
      .then((r) => r.data.data),

  remove: (id: string) =>
    api.delete(`/client/notifications/${id}`).then((r) => r.data),

  clearRead: () =>
    api
      .post<{ data: { deleted: number } }>('/client/notifications/clear-read')
      .then((r) => r.data.data),
};