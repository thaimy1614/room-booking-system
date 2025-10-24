import axios from '../configs/AxiosConfig';

export const handleGetAllFacilities = async () => {
    try {
        const response = await axios.get('/facilities', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });
        const data = response.data;
        return data;
    } catch (error) {
        console.error('Error fetching facilities:', error);
        throw error;
    }
};