import api from './axios';
import type { Category, MenuItem } from '../types';

type CategoryDetail = Category & { menuItems: MenuItem[] };

export const categoriesApi = {
  getAll: () => api.get<Category[]>('/categories').then((r) => r.data),

  getOne: (id: string) => api.get<CategoryDetail>(`/categories/${id}`).then((r) => r.data),

  create: (data: { name: string; order?: number }) =>
    api.post<Category>('/categories', data).then((r) => r.data),

  update: (id: string, data: { name?: string; order?: number }) =>
    api.patch<Category>(`/categories/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/categories/${id}`),
};
