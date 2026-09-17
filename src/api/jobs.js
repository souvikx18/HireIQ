import { apiClient } from './client.js';

export const jobsApi = {
  getJobs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/jobs${query ? `?${query}` : ''}`);
  },

  getJob: async (id) => {
    return apiClient(`/jobs/${id}`);
  },

  createJob: async (jobData) => {
    return apiClient('/jobs', {
      method: 'POST',
      body: jobData,
    });
  },

  deleteJob: async (id) => {
    return apiClient(`/jobs/${id}`, {
      method: 'DELETE',
    });
  },
};
