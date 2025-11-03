import axios from '../configs/AxiosConfig';
import { toast } from 'react-toastify';

export const handleGetRoomWithFilters = async (filters) => {
  try {
    const response = await axios.get('/rooms', {
      params: filters,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to fetch rooms');
    throw error;
  }
};

export const handleGetRoomById = async (roomId) => {
  try {
    const response = await axios.get(`/rooms/${roomId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to fetch room');
    throw error;
  }
};

export const handleCreateRoom = async (roomData) => {
  try {
    const response = await axios.post('/rooms', roomData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    return response.data;
  } catch (error) {
    const arrayErrors = error.response?.data?.message;
    let errorMessages = "";
    if (Array.isArray(arrayErrors)) {
      arrayErrors.forEach(errMsg => errorMessages += `${errMsg}\n`);
    } else {
      errorMessages = error.response?.data?.message || "";
    }
    throw new Error(errorMessages || 'Failed to create room');
  }
};

export const handleUpdateRoom = async (roomId, roomData) => {
  try {
    const response = await axios.put(`/rooms/${roomId}`, roomData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    return response.data;
  } catch (error) {
    const arrayErrors = error.response?.data?.message;
    let errorMessages = "";
    if (Array.isArray(arrayErrors)) {
      arrayErrors.forEach(errMsg => errorMessages += `${errMsg}\n`);
    } else {
      errorMessages = error.response?.data?.message || "";
    }
    throw new Error(errorMessages || 'Failed to create room');
  }
};

export const handleDeleteRoom = async (roomId) => {
  try {
    const response = await axios.delete(`/rooms/${roomId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to delete room');
    throw error;
  }
};

export const handleGetAvailableRooms = async (filters) => {
  try {
    const response = await axios.get('/rooms/available', {
      params: filters,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch available rooms');
  }
};

export const handleGetActiveRooms = async (filters) => {
  try {
    const response = await axios.get('/rooms/active', {
      params: filters,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch available rooms');
  }
};
