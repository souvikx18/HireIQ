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

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    throw new Error('Unable to connect to the HireIQ backend service. Please try again in a moment.');
  }

  // On 401: do NOT aggressively clear localStorage — one failed API call
  // (e.g. candidates list timing out) shouldn't break every other request.
  // Let individual pages/auth flows handle logout explicitly.

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let message = data.message;
    if (!message) {
      if (response.status === 502 || response.status === 503 || response.status === 504) {
        message = 'Server was momentarily restarting. Please click Login again.';
      } else if (response.status === 401) {
        message = 'Invalid email or password';
      } else if (response.status === 403) {
        message = 'Access forbidden. You do not have permission for this action.';
      } else if (response.status === 404) {
        message = 'API endpoint not found.';
      } else {
        message = data.error || 'An error occurred with the request';
      }
    }

    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

