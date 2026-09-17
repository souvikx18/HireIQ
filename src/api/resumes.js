import { apiClient } from './client.js';

export const resumesApi = {
  uploadResume: async (file, jobRoleId = '') => {
    const formData = new FormData();
    formData.append('resume', file);
    if (jobRoleId) {
      formData.append('jobRoleId', jobRoleId);
    }

    return apiClient('/resumes/upload', {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },

  getHistory: async () => {
    return apiClient('/resumes/history');
  },
};
