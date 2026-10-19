import { apiClient } from './client';
import type { User, StudentProfile } from '../types';

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

export interface MeResponse {
  user: User;
  profile?: StudentProfile | null;
}

export const authApi = {
  async login(credentials: { email: string; password: string }): Promise<LoginResponse> {
    const res = await apiClient.post<LoginResponse>('/auth/login', credentials);
    if (res.data.token) {
      localStorage.setItem('mm_token', res.data.token);
    }
    return res.data;
  },

  async register(data: {
    email: string;
    password: string;
    fullName: string;
    college?: string;
    course?: string;
    semester?: string;
  }): Promise<RegisterResponse> {
    const res = await apiClient.post<RegisterResponse>('/auth/register', data);
    if (res.data.token) {
      localStorage.setItem('mm_token', res.data.token);
    }
    return res.data;
  },

  async me(): Promise<MeResponse> {
    const res = await apiClient.get<MeResponse>('/auth/me');
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('mm_token');
    }
  },
};
