import axios from '../configs/AxiosConfig';

export const handleGetSchedulesOfRoom = async (filters) => {
  try {
    const response = await axios.get('/schedules', { params: filters,
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