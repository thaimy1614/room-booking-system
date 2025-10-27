import axios from '../configs/AxiosConfig';

export const handleGetAuditLogsWithFilters = async (filters) => {
  try {
    const response = await axios.get('/audit-logs', { params: filters,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
     });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch audit logs');
  }
};