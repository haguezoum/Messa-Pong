import Auth from './Auth.js';

class API {
  static async get(endpoint, options = {}) {
    return this.request(endpoint, { 
      ...options,
      method: 'GET'
    });
  }

  static async post(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async put(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      ...options, 
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  static async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE'
    });
  }

  static async request(endpoint, options = {}) {
    try {
      const accessToken = Auth.getCookie('accessToken');
      
      const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
      };

      const response = await fetch(`/api${endpoint}`, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }
      return await response.text();

    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  static async getUser() {
    return this.get('/user');
  }

  // Auth-related methods
  static auth = {
    isAuthenticated() {
      return Auth.isAuthenticated();
    },
    
    async isAuthenticatedWithServerCheck() {
      try {
        const response = await API.get('/auth/verify/');
        return response.status === 200;
      } catch (error) {
        console.error('Server authentication check failed:', error);
        // Fall back to client-side check if server is unavailable
        return Auth.isAuthenticated();
      }
    }
  }
}

export default API;