import { apiClient } from './client.js';

export const analyticsApi = {
  getOverview: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/analytics/overview${query ? `?${query}` : ''}`);
  },

  getSkillGaps: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/analytics/skill-gaps${query ? `?${query}` : ''}`);
  },
};
