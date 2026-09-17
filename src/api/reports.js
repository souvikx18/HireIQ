import { apiClient } from './client.js';

export const reportsApi = {
  generateReport: async ({ reportName, dateRange }) => {
    return apiClient('/reports/generate', {
      method: 'POST',
      body: { reportName, dateRange },
    });
  },
};
