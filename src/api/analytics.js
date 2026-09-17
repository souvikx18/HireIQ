import { apiClient } from './client.js';

export const analyticsApi = {
  getOverview: async () => {
    return apiClient('/analytics/overview');
  },

  getSkillGaps: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/analytics/skill-gaps${query ? `?${query}` : ''}`);
  },
};
