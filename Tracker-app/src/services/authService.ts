import api from './api';
import type { AuthResponse, User } from '../types';

export const authService = {
  signup: async (data: { username: string; email: string; password: string; name: string }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/signup', data);
    return res.data;
  },

  login: async (data: { username: string; password: string }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  forgotPassword: async (identifier: string): Promise<{ message: string; email?: string }> => {
    const res = await api.post<{ message: string; email?: string }>('/auth/forgot-password', { identifier });
    return res.data;
  },

  verifyOtp: async (data: { email: string; otp: string }): Promise<{ message: string }> => {
    const res = await api.post<{ message: string }>('/auth/verify-otp', data);
    return res.data;
  },

  resetPassword: async (data: { email: string; otp: string; newPassword: string }): Promise<{ message: string }> => {
    const res = await api.post<{ message: string }>('/auth/reset-password', data);
    return res.data;
  },

  getMe: async (): Promise<User> => {
    const res = await api.get<{ user: User }>('/auth/me');
    return res.data.user;
  },
};
