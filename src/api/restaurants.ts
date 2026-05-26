import api from './axios';
import type { Restaurant, RestaurantDetail, RestaurantWithMenu, Stats } from '../types';

export const restaurantsApi = {
  getAll: () => api.get<Restaurant[]>('/restaurants').then((r) => r.data),

  getBySlug: (slug: string) =>
    api.get<RestaurantWithMenu>(`/restaurants/public/${slug}`).then((r) => r.data),

  getOne: (id: string) => api.get<RestaurantDetail>(`/restaurants/${id}`).then((r) => r.data),

  getStats: () => api.get<Stats>('/restaurants/stats').then((r) => r.data),

  create: (formData: FormData) =>
    api.post<Restaurant>('/restaurants', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  update: (id: string, formData: FormData) =>
    api.patch<Restaurant>(`/restaurants/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  delete: (id: string) => api.delete(`/restaurants/${id}`),

  getQRCode: (id: string) =>
    api.get(`/restaurants/${id}/qrcode`, { responseType: 'blob' }).then((r) => r.data),
};
