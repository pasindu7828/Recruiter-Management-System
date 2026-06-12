const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085').replace(/\/$/, '');
const API_VERSION = (import.meta.env.VITE_API_VERSION || '/api/v1').startsWith('/')
  ? (import.meta.env.VITE_API_VERSION || '/api/v1')
  : `/${import.meta.env.VITE_API_VERSION || 'api/v1'}`;

const API_URL = `${API_BASE_URL}${API_VERSION}`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const getRequest = async (endpoint) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Failed to fetch ${endpoint}`);
  }

  return data;
};

export const getAdminDashboardData = async () => {
  const [usersData, candidatesData, recruitersData] = await Promise.all([
    getRequest('/users/all-users'),
    getRequest('/users/candidates'),
    getRequest('/users/recruiters'),
  ]);

  return {
    users: Array.isArray(usersData?.users) ? usersData.users : [],
    candidates: Array.isArray(candidatesData?.candidates)
      ? candidatesData.candidates
      : [],
    recruiters: Array.isArray(recruitersData?.recruiters)
      ? recruitersData.recruiters
      : [],
  };
};
