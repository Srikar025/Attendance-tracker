import api from './api';
import type { User } from '../types';

export const userService = {
  updateProfile: async (data: { name: string }): Promise<User> => {
    const res = await api.put<{ user: User }>('/user/profile', data);
    return res.data.user;
  },

  updateTotals: async (data: {
    totalClassesHeld: number;
    totalClassesAttended: number;
  }): Promise<{ user: User; percentage: number }> => {
    const res = await api.put<{ user: User; percentage: number }>('/user/totals', data);
    return res.data;
  },
};
