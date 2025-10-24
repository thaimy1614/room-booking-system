import axios from "../configs/AxiosConfig";

export const handleLogin = async (username, password) => {
  if (!username || !password) {
    throw new Error('Please fill in all fields');
  }
  try {
    const response = await axios.post('/login', { username, password });
    const data = response.data;
    if (!data.ok) {
      throw new Error(data.message || 'Invalid username or password');
    }
    return { token: data.token, user: data.user };
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message || 'Network error');
  }
};