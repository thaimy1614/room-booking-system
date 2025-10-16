import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Avatar, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import LogoutIcon from '@mui/icons-material/Logout';

function Header() {
  const fullName = localStorage.getItem('fullName') || 'User';
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/project/login';
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
      <Navbar.Brand href="/project">Meeting Room Booking</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ms-auto align-items-center">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="outlined" color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
              Logout
            </Button>
          </motion.div>
          <Avatar sx={{ ml: 2, bgcolor: 'secondary.main' }}>{fullName[0]}</Avatar>
          <Typography variant="subtitle1" sx={{ ml: 1, color: 'white' }}>{fullName}</Typography>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Header;