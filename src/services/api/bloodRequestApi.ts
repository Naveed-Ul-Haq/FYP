import { apiClient } from './apiClient';

export const bloodRequestApi = {

  create: async (requestData: {
    userId: string;
    bloodType: string;
    units: number;
    urgency: 'low' | 'medium' | 'high' | 'emergency';
    notes?: string;
  }) => {
    return apiClient.post('/requests', requestData);
  },

  getAll: async (filters?: any) => {
    return apiClient.get('/requests', { params: filters });
  },

  getById: async (id: string) => {
    return apiClient.get(`/requests/${id}`);
  },

  update: async (id: string, updates: any) => {
    return apiClient.put(`/requests/${id}`, updates);
  },

  delete: async (id: string) => {
    return apiClient.delete(`/requests/${id}`);
  },

  respond: async (requestId: string, donorId: string, response: 'accepted' | 'declined') => {
    return apiClient.post(`/requests/${requestId}/respond`, { donorId, response });
  },
};

