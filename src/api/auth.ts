import api from './axios';
import type { AuthResponse, User } from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),

  getMe: () => api.get<User>('/auth/me').then((r) => r.data),

  register: (data: { name: string; email: string; password: string; restaurantId?: string }) =>
    api.post<AuthResponse>('/auth/register', { ...data, role: 'ADMIN' }).then((r) => r.data),

  getAdmins: () => api.get<User[]>('/auth/users').then((r) => r.data),

  deleteUser: (id: string) => api.delete(`/auth/users/${id}`),
};
