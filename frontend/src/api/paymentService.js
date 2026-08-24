import apiClient from './apiClient';

export const paymentService = {
  // 1. Get Logged-in Farmer's Payments & Receipts
  async getMyPayments() {
    const response = await apiClient.get('/payments/my-payments');
    return response.data;
  },

  // 2. Get specific Payment Receipt by ID
  async getPaymentReceipt(paymentId) {
    const response = await apiClient.get(`/payments/receipt/${paymentId}`);
    return response.data;
  },

  // 3. Admin: Get all farmer payments & transactions
  async getAllPayments(params = {}) {
    const response = await apiClient.get('/admin/payments', { params });
    return response.data;
  },

  // 4. Admin: Update Payment Status & Transaction Reference ID
  async updatePaymentStatus(paymentId, paymentData) {
    const response = await apiClient.put(`/admin/payments/${paymentId}`, paymentData);
    return response.data;
  },
};

export default paymentService;
