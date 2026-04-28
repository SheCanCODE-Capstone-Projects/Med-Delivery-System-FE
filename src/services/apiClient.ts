// Abstract API Client for handling base URLs, interceptors, etc.

const BASE_URL = 'https://api.meddelivery.com/v1'; // Replace with real URL

export const apiClient = async (endpoint, options: any = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  
  // You would typically attach JWT tokens here
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
};
