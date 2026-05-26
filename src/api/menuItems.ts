import api from './axios';
import type { MenuItem } from '../types';

export const menuItemsApi = {
  getAll: () => api.get<MenuItem[]>('/menu').then((r) => r.data),

  getOne: (id: string) => api.get<MenuItem>(`/menu/${id}`).then((r) => r.data),

  create: (formData: FormData) =>
    api.post<MenuItem>('/menu', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  update: (id: string, formData: FormData) =>
    api.patch<MenuItem>(`/menu/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  delete: (id: string) => api.delete(`/menu/${id}`),
};
