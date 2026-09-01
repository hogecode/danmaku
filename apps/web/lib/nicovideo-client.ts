import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const nicovideClient = axios.create({
  baseURL: `${API_BASE}/nicovideo`,
  withCredentials: true,
});

export const nicovideApi = {
  // 認証
  login: async (email: string, password: string) => {
    const response = await nicovideClient.post('/auth/login', { email, password });
    return response.data;
  },

  logout: async () => {
    const response = await nicovideClient.delete('/auth/logout');
    return response.data;
  },

  // ダウンロード
  downloadVideo: async (videoId: string, quality?: 'high' | 'low' | 'auto', downloadComments?: boolean) => {
    const response = await nicovideClient.post('/download/video', {
      videoId,
      quality,
      downloadComments,
    });
    return response.data;
  },

  downloadComments: async (videoId: string, commentsLimit?: number, commentsFrom?: number) => {
    const response = await nicovideClient.post('/download/comments', {
      videoId,
      commentsLimit,
      commentsFrom,
    });
    return response.data;
  },

  // ステータス確認
  getDownloadStatus: async (taskId: string) => {
    const response = await nicovideClient.get(`/status/${taskId}`);
    return response.data;
  },
};
