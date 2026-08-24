import apiClient from './apiClient';

export const queueService = {
  // 1. Get Live Queue Status for logged-in Farmer's active booking
  async getMyQueueStatus(bookingId = '') {
    const response = await apiClient.get('/queue/my-status', {
      params: bookingId ? { bookingId } : {},
    });
    return response.data;
  },

  // 2. Get Centre Live Queue Display (Public / Farmer view)
  async getCentreQueue(centreId) {
    const response = await apiClient.get('/queue/live', {
      params: { centreId },
    });
    return response.data;
  },

  // 3. Admin: Get Today's Full Queue for Procurement Centre
  async getAdminQueue(centreId = '') {
    const response = await apiClient.get('/admin/queue', {
      params: centreId ? { centreId } : {},
    });
    return response.data;
  },

  // 4. Admin: Update Status of a Token (WAITING, CALLED, IN_PROCUREMENT, COMPLETED)
  async updateTokenStatus(tokenId, status, notes = '') {
    const response = await apiClient.put(`/admin/queue/${tokenId}/status`, {
      status,
      notes,
    });
    return response.data;
  },
};

export default queueService;
