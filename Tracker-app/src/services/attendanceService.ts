import api from './api';
import type { DailyRecord, DailyRecordResponse, StatsResponse } from '../types';

export const attendanceService = {
  createDaily: async (data: {
    date: string;
    classesHeld: number;
    classesAttended: number;
  }): Promise<DailyRecordResponse> => {
    const res = await api.post<DailyRecordResponse>('/attendance/daily', data);
    return res.data;
  },

  getDaily: async (date: string): Promise<DailyRecord> => {
    const res = await api.get<{ record: DailyRecord }>(`/attendance/daily?date=${date}`);
    return res.data.record;
  },

  updateDaily: async (
    id: string,
    data: { classesHeld: number; classesAttended: number }
  ): Promise<DailyRecordResponse> => {
    const res = await api.put<DailyRecordResponse>(`/attendance/daily/${id}`, data);
    return res.data;
  },

  getHistory: async (): Promise<DailyRecord[]> => {
    const res = await api.get<{ records: DailyRecord[] }>('/attendance/history');
    return res.data.records;
  },

  getStats: async (): Promise<StatsResponse> => {
    const res = await api.get<StatsResponse>('/attendance/stats');
    return res.data;
  },
};
