const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function apiClient(endpoint, { body, headers = {}, method = 'GET', isFormData = false, ...customConfig } = {}) {
  const token = localStorage.getItem('hireiq_token');

  const defaultHeaders = {};
  if (!isFormData) {
    defaultHeaders['Content-Type'] = 'application/json';
  }
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...customConfig,
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const response = await fetch(url, config);

  if (response.status === 401) {
    // If unauthorized, clear storage and dispatch logout event if not on login/signup page
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
      localStorage.removeItem('hireiq_token');
      localStorage.removeItem('hireiq_user');
      localStorage.setItem('isAuthenticated', 'false');
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'An error occurred with the request');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
