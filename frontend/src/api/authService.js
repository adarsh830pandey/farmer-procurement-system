import apiClient from './apiClient';

export const authService = {
  // 1. Farmer Registration
  async registerFarmer(userData) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  // 2. Farmer Login (Mobile & Password)
  async loginFarmer(credentials) {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.data?.token) {
      localStorage.setItem('kisan_auth_token', response.data.token);
      localStorage.setItem('kisan_user', JSON.stringify(response.data.user || response.data.farmer));
      localStorage.setItem('kisan_role', 'farmer');
    }
    return response.data;
  },

  // 3. Admin Login (Username/Email & Password)
  async loginAdmin(credentials) {
    const response = await apiClient.post('/auth/admin-login', credentials);
    if (response.data?.token) {
      localStorage.setItem('kisan_auth_token', response.data.token);
      localStorage.setItem('kisan_user', JSON.stringify(response.data.user || response.data.admin));
      localStorage.setItem('kisan_role', 'admin');
    }
    return response.data;
  },

  // 4. Fetch current user profile
  async getCurrentUser() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // 5. Update Farmer Profile
  async updateFarmerProfile(profileData) {
    const response = await apiClient.put('/farmer/profile', profileData);
    return response.data;
  },

  // 6. Logout
  logout() {
    localStorage.removeItem('kisan_auth_token');
    localStorage.removeItem('kisan_user');
    localStorage.removeItem('kisan_role');
  },
};

export default authService;
