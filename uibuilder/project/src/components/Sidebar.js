import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import RoomIcon from '@mui/icons-material/Room';
import HistoryIcon from '@mui/icons-material/History';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const linkVariants = {
  hover: { scale: 1.05, x: 5 },
};

function Sidebar({ role }) {
  return (
    <Nav className="flex-column bg-light p-3 shadow-lg" style={{ height: '100vh' }}>
      {(role === 'USER' || role === 'ADMIN') && (
        <>
          <motion.div variants={linkVariants} whileHover="hover">
            <Nav.Link as={Link} to="/available-rooms"><RoomIcon sx={{ mr: 1 }} /> Available Rooms</Nav.Link>
          </motion.div>
          <motion.div variants={linkVariants} whileHover="hover">
            <Nav.Link as={Link} to="/my-bookings"><HistoryIcon sx={{ mr: 1 }} /> My Bookings</Nav.Link>
          </motion.div>
          <motion.div variants={linkVariants} whileHover="hover">
            <Nav.Link as={Link} to="/schedule"><ScheduleIcon sx={{ mr: 1 }} /> Schedule</Nav.Link>
          </motion.div>
        </>
      )}
      {role === 'ADMIN' && (
        <>
          <hr />
          <motion.div variants={linkVariants} whileHover="hover">
            <Nav.Link as={Link} to="/admin/rooms"><AdminPanelSettingsIcon sx={{ mr: 1 }} /> Room Management</Nav.Link>
          </motion.div>
          <motion.div variants={linkVariants} whileHover="hover">
            <Nav.Link as={Link} to="/admin/bookings"><AdminPanelSettingsIcon sx={{ mr: 1 }} /> Bookings Management</Nav.Link>
          </motion.div>
          <motion.div variants={linkVariants} whileHover="hover">
            <Nav.Link as={Link} to="/admin/audit-logs"><AdminPanelSettingsIcon sx={{ mr: 1 }} /> Audit Logs</Nav.Link>
          </motion.div>
        </>
      )}
    </Nav>
  );
}

export default Sidebar;