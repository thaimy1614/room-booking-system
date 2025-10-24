import axios from '../configs/AxiosConfig';

export const handleGetMyBookingsWithFilters = async (filters) => {
  try {
    const response = await axios.get('/my-bookings', { params: filters,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
     });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
  }
};

export const handleCancelMyBooking = async (bookingId) => {
  try {
    const response = await axios.post(`/my-bookings/${bookingId}/cancel`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to cancel booking');
  }
};
