import React, { useState } from 'react';
import { Card, Container } from 'react-bootstrap';
import { TextField, Button, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import LoginIcon from '@mui/icons-material/Login';
import { handleLogin } from '../services/AuthAPIs';
import { setToken, setUserInfo } from '../services/LocalStorageService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../configs/AxiosConfig';
import { useAuth } from '../context/AuthContext';

const cardVariants = {
  initial: { y: -50, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await handleLogin(username, password);
      
      login(token, user);
      toast.success('Login successful!');
      
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      toast.error(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100 bg-gradient" style={{ background: 'linear-gradient(to right, #1976d2, #f50057)' }}>
      <motion.div variants={cardVariants} initial="initial" animate="animate">
        <Card style={{ width: '400px' }} className="p-4 shadow-lg border-0 rounded-lg">
          <motion.h3 className="text-center mb-4" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
            Welcome Back
          </motion.h3>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              InputProps={{ startAdornment: <LoginIcon sx={{ mr: 1 }} /> }}
              disabled={loading}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 2, py: 1.5 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Login'}
              </Button>
            </motion.div>
          </form>
        </Card>
      </motion.div>
      {/* ToastContainer is in index.js - no need here */}
    </Container>
  );
}

export default Login;