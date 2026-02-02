const BASE_URL = 'http://10.29.64.21:3000/api';
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async get(endpoint: string, config?: any) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(config && config.headers ? config.headers : {})
        },
        ...config
      });
      if (!response.ok) throw new Error(await response.text());
      return await response.json();
    } catch (error) {
      this.handleError(error);
    }
  }

  async post(endpoint: string, data: any, config?: any) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config && config.headers ? config.headers : {})
        },
        body: JSON.stringify(data),
        ...config
      });
      if (!response.ok) throw new Error(await response.text());
      return await response.json();
    } catch (error) {
      this.handleError(error);
    }
  }

  async put(endpoint: string, data: any, config?: any) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(config && config.headers ? config.headers : {})
        },
        body: JSON.stringify(data),
        ...config
      });
      if (!response.ok) throw new Error(await response.text());
      return await response.json();
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete(endpoint: string, config?: any) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(config && config.headers ? config.headers : {})
        },
        ...config
      });
      if (!response.ok) throw new Error(await response.text());
      return await response.json();
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    throw error;
  }
}

export const apiClient = new ApiClient(BASE_URL);

