import api from './api';
import type { AuthResponse, User } from '../types';

export const authService = {
  signup: async (data: { username: string; password: string; name: string }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/signup', data);
    return res.data;
  },

  login: async (data: { username: string; password: string }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  getMe: async (): Promise<User> => {
    const res = await api.get<{ user: User }>('/auth/me');
    return res.data.user;
  },
};
