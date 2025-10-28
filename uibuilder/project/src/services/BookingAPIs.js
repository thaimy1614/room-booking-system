import axios from '../configs/AxiosConfig';

export const handleGetBookingsWithFilters = async (filters) => {
  try {
    const response = await axios.get('/bookings', { params: filters,
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

export const handleApproveBooking = async (bookingId) => {
  try {
    const response = await axios.post(`/bookings/approve`, { booking_id: bookingId }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to approve booking');
  }
};

export const handleRejectBooking = async (bookingId, reason) => {
  try {
    const response = await axios.post(`/bookings/reject`, { action_reason: reason, booking_id: bookingId }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to reject booking');
  }
};

export const handleCancelBooking = async (bookingId, reason) => {
  try {
    const response = await axios.post(`/bookings/cancel`, { action_reason: reason, booking_id: bookingId }, {
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

export const handleCreateBooking = async (data) => {
  try {
    const response = await axios.post('/bookings', data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create booking');
  }
};