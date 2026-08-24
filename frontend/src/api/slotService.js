import apiClient from './apiClient';

export const slotService = {
  // 1. Get List of Districts
  async getDistricts() {
    const response = await apiClient.get('/slots/districts');
    return response.data;
  },

  // 2. Get Procurement Centres (optionally filtered by district)
  async getCentres(district = '') {
    const response = await apiClient.get('/slots/centres', {
      params: district ? { district } : {},
    });
    return response.data;
  },

  // 3. Get Available Time Slots for a Centre & Date
  async getAvailableSlots(centreId, date) {
    const response = await apiClient.get('/slots/available', {
      params: { centreId, date },
    });
    return response.data;
  },

  // 4. Book a Procurement Slot
  async bookSlot(bookingData) {
    const response = await apiClient.post('/slots/book', bookingData);
    return response.data;
  },

  // 5. Get current farmer's active and past slot bookings
  async getMyBookings() {
    const response = await apiClient.get('/slots/my-bookings');
    return response.data;
  },

  // Admin APIs
  // 6. Admin: Get all configured slots
  async getAllSlots(centreId = '') {
    const response = await apiClient.get('/admin/slots', {
      params: centreId ? { centreId } : {},
    });
    return response.data;
  },

  // 7. Admin: Create a new slot
  async createSlot(slotData) {
    const response = await apiClient.post('/admin/slots', slotData);
    return response.data;
  },

  // 8. Admin: Update / Toggle slot capacity or status
  async updateSlot(slotId, updateData) {
    const response = await apiClient.put(`/admin/slots/${slotId}`, updateData);
    return response.data;
  },

  // 9. Admin: Delete slot
  async deleteSlot(slotId) {
    const response = await apiClient.delete(`/admin/slots/${slotId}`);
    return response.data;
  },
};

export default slotService;
