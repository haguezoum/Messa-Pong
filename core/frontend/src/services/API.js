import Auth from './Auth.js';

const API_BASE_URL = '/api/'; // Matches Django's URL patterns

// Simple XSS sanitization (consider sanitize-html for production)
const sanitizeInput = (input) => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

// In-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Debounce utility
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    return new Promise((resolve) => {
      timeout = setTimeout(() => resolve(func(...args)), wait);
    });
  };
};

const API = async (method, endpoint, data = null) => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
  const cacheKey = `${method}:${url}:${JSON.stringify(data)}`;

  if (cache.has(cacheKey)) {
    const { data: cachedData, timestamp } = cache.get(cacheKey);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return cachedData;
    }
    cache.delete(cacheKey); // Clear stale cache
  }

  let accessToken = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${accessToken || ''}`,
  };

  const options = { method, headers, credentials: 'include' };
  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    let response = await fetch(url, options);
    if (response.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token available');

      const refreshResponse = await fetch(`${API_BASE_URL}auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!refreshResponse.ok) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        throw new Error('Session expired. Please log in again.');
      }

      const { access } = await refreshResponse.json();
      localStorage.setItem('access_token', access);
      headers['Authorization'] = `Bearer ${access}`;
      options.headers = headers;

      response = await fetch(url, options);
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    throw error;
  }
};

const debouncedAPI = debounce(API, 300);

export default API;
export { debouncedAPI, sanitizeInput };
