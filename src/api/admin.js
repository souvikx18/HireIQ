import { apiClient } from './client.js';

export const adminApi = {
  getHealth: async () => {
    return apiClient('/admin/health');
  },

  getAuditLogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/admin/audit-logs${query ? `?${query}` : ''}`);
  },

  getUsers: async () => {
    return apiClient('/admin/users');
  },

  updateUserRole: async (id, role) => {
    return apiClient(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: { role },
    });
  },
};
