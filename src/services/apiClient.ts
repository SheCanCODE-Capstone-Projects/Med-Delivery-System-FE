/**
 * Abstract API Client for handling base URLs, authentication, and request/response interception.
 * Provides a centralized way to manage API calls across the application.
 * 
 * @param endpoint - The API endpoint path (e.g., '/auth/login')
 * @param options - Fetch options including method, headers, and body
 * @returns Promise resolving to the JSON response data
 * @throws Error if the response status is not OK (4xx or 5xx)
 */

const BASE_URL = 'https://api.meddelivery.com/v1'; // Replace with real URL

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
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