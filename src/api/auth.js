import { apiClient } from './client.js';

export const authApi = {
  login: async ({ email, password }) => {
    return apiClient('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  register: async ({ firstName, lastName, email, password }) => {
    return apiClient('/auth/register', {
      method: 'POST',
      body: { firstName, lastName, email, password },
    });
  },

  logout: async (refreshToken) => {
    return apiClient('/auth/logout', {
      method: 'POST',
      body: { refreshToken },
    });
  },

  getProfile: async () => {
    return apiClient('/users/profile');
  },

  updateProfile: async (profileData) => {
    return apiClient('/users/profile', {
      method: 'PUT',
      body: profileData,
    });
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    return apiClient('/users/change-password', {
      method: 'PUT',
      body: { currentPassword, newPassword },
    });
  },
};
