import { apiClient } from './client.js';

export const aiApi = {
  chat: async (message) => {
    return apiClient('/ai/chat', {
      method: 'POST',
      body: { message },
    });
  },
};
