import { apiClient } from './client.js';

export const candidatesApi = {
  getCandidates: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/candidates${query ? `?${query}` : ''}`);
  },

  getCandidate: async (id) => {
    return apiClient(`/candidates/${id}`);
  },

  updateStatus: async (id, status) => {
    return apiClient(`/candidates/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  },

  deleteCandidate: async (id) => {
    return apiClient(`/candidates/${id}`, {
      method: 'DELETE',
    });
  },

  addReview: async (id, { reviewText, rating }) => {
    return apiClient(`/candidates/${id}/reviews`, {
      method: 'POST',
      body: { reviewText, rating },
    });
  },
};
