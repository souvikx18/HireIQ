import { apiClient } from './client.js';

export const candidatePortalApi = {
  // Audit Resume (ATS Check)
  auditResume: async (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return apiClient('/candidate-portal/audit', {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },

  // Get Open Jobs with Live Candidate Match
  getJobs: async () => {
    return apiClient('/candidate-portal/jobs');
  },

  // Get Candidate Profile
  getProfile: async () => {
    return apiClient('/candidate-portal/profile');
  },

  // 1-Click Apply for Job
  applyForJob: async (jobId) => {
    return apiClient(`/candidate-portal/apply/${jobId}`, {
      method: 'POST',
    });
  },

  // Get Applications
  getMyApplications: async () => {
    return apiClient('/candidate-portal/applications');
  },
};
