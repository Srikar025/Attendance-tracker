// User model
export interface User {
  _id: string;
  username: string;
  name: string;
  totalClassesHeld: number;
  totalClassesAttended: number;
  createdAt: string;
}

// Daily record model
export interface DailyRecord {
  _id: string;
  userId: string;
  date: string; // "YYYY-MM-DD"
  classesHeld: number;
  classesAttended: number;
  createdAt: string;
  updatedAt: string;
}

// API responses
export interface AuthResponse {
  token: string;
  user: User;
}

export interface StatsResponse {
  totalHeld: number;
  totalAttended: number;
  percentage: number;
  streak: number;
}

export interface UpdatedUserPartial {
  totalClassesHeld: number;
  totalClassesAttended: number;
  percentage: number;
}

export interface DailyRecordResponse {
  dailyRecord: DailyRecord;
  updatedUser: UpdatedUserPartial;
}

// Toast
export type ToastType = 'success' | 'error' | 'info';
export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}
