'use client';

// API base URL - using Next.js proxy to avoid CORS issues
const API_BASE_URL = '/api';
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
// Generic fetch function with error handling
async function fetchFromAPI(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Create a custom error with the error data
      const error: any = new Error(errorData.error || errorData.message || `API error: ${response.status}`);
      error.data = errorData;
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error('APIリクエストに失敗しました:', error);
    throw error;
  }
}

// Products API
export const productsApi = {
  // Get all products
  getProducts: () => fetchFromAPI('/products'),
  
  // Get a single product by ID
  getProduct: (id: number) => fetchFromAPI(`/products/${id}`),
  
  // Add a new product
  addProduct: (productUrl: string) => 
    fetchFromAPI('/products/add', {
      method: 'POST',
      body: JSON.stringify({ url: productUrl }),
    }),
  
  // Update product settings
  updateProduct: (id: number, data: any) => 
    fetchFromAPI(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  // Delete a product
  deleteProduct: (id: number) => 
    fetchFromAPI(`/products/${id}`, {
      method: 'DELETE',
    }),
  
  // Get price history for a product
  getPriceHistory: (id: number) => 
    fetchFromAPI(`/products/${id}/history`),
};

// Notification API
export const notificationsApi = {
  // Get notification settings
  getSettings: () => fetchFromAPI('/notifications/settings'),
  
  // Update notification settings
  updateSettings: (settings: any) => 
    fetchFromAPI('/notifications/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    }),
  
  // Get notification history
  getHistory: () => fetchFromAPI('/notifications/history'),
};

// Snidan account API
export const snidanApi = {
  // Get Snidan account settings
  getSettings: () => fetchFromAPI('/snidan/settings'),
  
  // Update Snidan account settings
  updateSettings: (settings: any) => 
    fetchFromAPI('/snidan/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    }),
};

// System API
export const systemApi = {
  // Get system status
  getLoginStatus: () => fetchFromAPI('/system/loginstatus'),
  
  // Start/stop monitoring
  toggleMonitoring: (isActive: boolean) => 
    fetchFromAPI('/system/monitoring', {
      method: 'POST',
      body: JSON.stringify({ active: isActive }),
    }),
}; 