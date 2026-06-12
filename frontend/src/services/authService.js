const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085').replace(/\/$/, '');
const API_VERSION = (import.meta.env.VITE_API_VERSION || '/api/v1').startsWith('/')
  ? (import.meta.env.VITE_API_VERSION || '/api/v1')
  : `/${import.meta.env.VITE_API_VERSION || 'api/v1'}`;

const API_URL = `${API_BASE_URL}${API_VERSION}`;

// Helper function to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Login User
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Login failed');
  }
};

// Register User
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Registration failed');
  }
};

// Logout User
export const logoutUser = async () => {
  try {
    const response = await fetch(`${API_URL}/users/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Logout failed');
    }

    // Clear localStorage on successful logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    return data;
  } catch (error) {
    // Clear localStorage even if request fails
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw new Error(error.message || 'Logout failed');
  }
};

// Change Password
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await fetch(`${API_URL}/users/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to change password');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to change password');
  }
};

// Get User Profile
export const getUserProfile = async () => {
  try {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
 
    const data = await response.json();
 
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch profile');
    }
 
    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch profile');
  }
};

// Update User Profile
export const updateUserProfile = async (profileData) => {
  try {
    const response = await fetch(`${API_URL}/users/update-profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
      credentials: 'include',
    });
 
    const data = await response.json();
 
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }
 
    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to update profile');
  }
};






