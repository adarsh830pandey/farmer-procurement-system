import apiClient from './apiClient';

export const procurementService = {
  // 1. Get complete procurement timeline/journey for a booking
  async getProcurementJourney(bookingId = '') {
    const response = await apiClient.get('/procurement/journey', {
      params: bookingId ? { bookingId } : {},
    });
    return response.data;
  },

  // 2. Admin: Record Procurement Weighment & Quality Check
  async recordProcurement(procurementData) {
    const response = await apiClient.post('/admin/procurement/record', procurementData);
    return response.data;
  },

  // 3. Admin: Get all recorded procurements
  async getProcurementRecords(params = {}) {
    const response = await apiClient.get('/admin/procurement/records', { params });
    return response.data;
  },
};

export default procurementService;
