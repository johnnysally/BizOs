import { api } from './axios';

export const publicChatApi = {
  message: (text: string) =>
    api
      .post<{ data: { reply: string; tokensUsed: number } }>('/public/chat/message', {
        text,
      })
      .then((r) => r.data.data),
};

export const clientChatApi = {
  message: (text: string) =>
    api
      .post<{ data: { reply: string; tokensUsed: number } }>('/client/chat/message', {
        text,
      })
      .then((r) => r.data.data),

  history: (limit = 50) =>
    api
      .get<{ data: Array<{ role: string; content: string; ts: string }> }>(
        '/client/chat/history',
        { params: { limit } }
      )
      .then((r) => r.data.data),

  clear: () => api.delete('/client/chat/history').then((r) => r.data),
};