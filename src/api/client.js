const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function apiClient(endpoint, { body, headers = {}, method = 'GET', isFormData = false, ...customConfig } = {}) {
  const rawToken = localStorage.getItem('hireiq_token');
  // Only attach token if it's a real non-null, non-empty string
  const token = rawToken && rawToken !== 'null' && rawToken !== 'undefined' ? rawToken : null;

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

  // On 401: do NOT aggressively clear localStorage — one failed API call
  // (e.g. candidates list timing out) shouldn't break every other request.
  // Let individual pages/auth flows handle logout explicitly.

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'An error occurred with the request');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

