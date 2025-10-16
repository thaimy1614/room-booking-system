import React, { useState } from 'react';
import { Card, Container } from 'react-bootstrap';
import { TextField, Button, Snackbar, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { mockLogin } from '../mockData';
import LoginIcon from '@mui/icons-material/Login';

const cardVariants = {
  initial: { y: -50, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { result, token } = await mockLogin(username, password);
      localStorage.setItem('token', token);
      localStorage.setItem('role', result.user.role_name);
      localStorage.setItem('userId', result.user.user_id);
      localStorage.setItem('fullName', result.user.full_name);
      window.location.href = '/project';
    } catch (err) {
      setError(err.message);
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
            <TextField label="Username" fullWidth margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} InputProps={{ startAdornment: <LoginIcon sx={{ mr: 1 }} /> }} />
            <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, py: 1.5 }}>Login</Button>
            </motion.div>
          </form>
        </Card>
      </motion.div>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Container>
  );
}

export default Login;