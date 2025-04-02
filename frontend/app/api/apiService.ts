'use client';

// API base URL - using Next.js proxy to avoid CORS issues
const base_url = process.env.NEXT_PUBLIC_API_URL;
// Generic fetch function with error handling
async function fetchFromAPI(endpoint: string, options: RequestInit = {}) {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Skip token check for login endpoint
    if (endpoint === '/login') {
      const response = await fetch(`${base_url}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      return handleResponse(response);
    }

    // If no token and not login endpoint, redirect to login
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const response = await fetch(`${base_url}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    // Handle 401 Unauthorized response
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return;
    }

    return handleResponse(response);
  } catch (error) {
    console.error('APIリクエストに失敗しました:', error);
    throw error;
  }
}

// Helper function to handle response
async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: any = new Error(errorData.error || errorData.message || `API error: ${response.status}`);
    error.data = errorData;
    error.status = response.status;
    throw error;
  }
  return await response.json();
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
  // Login
  login: (user_id: string, password: string) => fetchFromAPI('/login', {
    method: 'POST',
    body: JSON.stringify({ user_id, password }),
  }),

  // Get system status
  getLoginStatus: () => fetchFromAPI('/system/loginstatus'),
  
  // Start/stop monitoring
  toggleMonitoring: (isActive: boolean) => 
    fetchFromAPI('/system/monitoring', {
      method: 'POST',
      body: JSON.stringify({ active: isActive }),
    }),
}; 