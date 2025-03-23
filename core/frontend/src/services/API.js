/**
 * 
 * This will take the endpoint URL, method and headers as input and return the response as JSON
 * @param {string} URL 
 * @param {string} metode
 * @param {Object} headers 
 * @returns {Promise}
 */

class API {
  static BASE_URL = 'https://localhost';
  static pendingRequests = new Map();

  static async request(endpoint, method = 'GET', data = null, customHeaders = {}) {
    // Create a unique key for this request
    const requestKey = `${method}:${endpoint}:${JSON.stringify(data)}`;
    
    // If there's already a pending request with the same key, return it
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey);
    }

    const url = `${this.BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders // Merge custom headers
    };

    const config = {
      method,
      headers,
      credentials: 'include', // This is important for CORS
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    // Create the promise for this request
    const requestPromise = (async () => {
      try {
        const response = await fetch(url, config);
        let responseData;
        
        try {
          responseData = await response.json();
        } catch (parseError) {
          console.error('Failed to parse response:', parseError);
          throw {
            status: response.status,
            error: 'Invalid server response',
            detail: 'The server response could not be processed'
          };
        }

        if (!response.ok) {
          // Check for specific error cases
          if (response.status === 401) {
            throw {
              status: 401,
              error: 'Authentication required',
              detail: 'Please log in to continue'
            };
          }
          
          throw {
            status: response.status,
            error: responseData.error || responseData.detail || 'An error occurred',
            detail: responseData.detail || 'Please try again'
          };
        }

        return responseData;
      } catch (error) {
        console.error(`API Error (${method} ${endpoint}):`, error);
        throw error;
      } finally {
        // Clean up the pending request
        this.pendingRequests.delete(requestKey);
      }
    })();

    // Store the promise
    this.pendingRequests.set(requestKey, requestPromise);

    return requestPromise;
  }

  static async get(endpoint, { headers = {} } = {}) {
    return this.request(endpoint, 'GET', null, headers);
  }

  static async post(endpoint, data, { headers = {} } = {}) {
    return this.request(endpoint, 'POST', data, headers);
  }

  static async put(endpoint, data, { headers = {} } = {}) {
    return this.request(endpoint, 'PUT', data, headers);
  }

  static async delete(endpoint, { headers = {} } = {}) {
    return this.request(endpoint, 'DELETE', null, headers);
  }
}

export default API;