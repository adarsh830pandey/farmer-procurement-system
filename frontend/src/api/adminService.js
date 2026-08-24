import apiClient from './apiClient';

export const adminService = {
  // 1. Get Dashboard Summary Overview Metrics
  async getDashboardStats() {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  // 2. Get List of Registered Farmers
  async getFarmersList(params = {}) {
    const response = await apiClient.get('/admin/farmers', { params });
    return response.data;
  },
};

export default adminService;
