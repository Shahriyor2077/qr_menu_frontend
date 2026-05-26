import api from './axios';
import type { PlanConfig } from '../types';

export interface PlanPayload {
  name: string;
  maxCategories: number;
  maxMenuItems: number;
  maxAdmins: number;
  price?: number;
  description?: string;
}

export const plansApi = {
  getAll: () => api.get<PlanConfig[]>('/plans').then((r) => r.data),
  create: (data: PlanPayload) => api.post<PlanConfig>('/plans', data).then((r) => r.data),
  update: (id: string, data: Partial<PlanPayload>) => api.patch<PlanConfig>(`/plans/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/plans/${id}`),
};
