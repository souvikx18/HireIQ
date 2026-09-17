import { apiClient } from './client.js';

export const skillsApi = {
  getSkills: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/skills${query ? `?${query}` : ''}`);
  },

  createSkill: async (skillData) => {
    return apiClient('/skills', {
      method: 'POST',
      body: skillData,
    });
  },

  updateSkill: async (id, updateData) => {
    return apiClient(`/skills/${id}`, {
      method: 'PUT',
      body: updateData,
    });
  },

  deleteSkill: async (id) => {
    return apiClient(`/skills/${id}`, {
      method: 'DELETE',
    });
  },

  seedDefaultSkills: async () => {
    return apiClient('/skills/seed', {
      method: 'POST',
    });
  },
};
