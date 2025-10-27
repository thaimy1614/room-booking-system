/* global uibuilder */
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import AvailableRooms from './pages/user/AvailableRooms';
import MyBookings from './pages/user/MyBookings';
import Schedule from './pages/user/Schedule';
import RoomManagement from './pages/admin/RoomManagement';
import BookingsManagement from './pages/admin/BookingsManagement';
import { useAuth } from './context/AuthContext';
import uibuilderSocket from './configs/uibuilderSocket';
import { toast } from 'react-toastify';
import AuditLogs from './pages/admin/AuditLogs';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#f50057' },
  },
});

function App() {
  const { currentUser, loading } = useAuth();
  const isLoggedIn = !!currentUser;
  const role = currentUser?.user?.role || null;
  const userId = currentUser?.user?.user_id || null;

  useEffect(() => {
    // Initialize uibuilder
    uibuilderSocket.init();
  }, []);

  uibuilder.onChange('msg', (msg) => {
    if(msg.topic === 'notification' && userId === msg.payload.receiver) {
      toast.info(msg.payload.message);
    }
  });

  if (loading) {
    return <div>Loading app...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <Router basename="/project">
        <Routes>
          <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <Login />} />
          <Route path="/" element={isLoggedIn ? <DashboardLayout role={role} /> : <Navigate to="/login" />}>
            <Route index element={<Navigate to={role === 'ADMIN' ? '/admin/rooms' : '/available-rooms'} />} />
            <Route path="available-rooms" element={role === 'USER' || role === 'ADMIN' ? <AvailableRooms /> : <Navigate to="/" />} />
            <Route path="my-bookings" element={role === 'USER' || role === 'ADMIN' ? <MyBookings /> : <Navigate to="/" />} />
            <Route path="schedule" element={role === 'USER' || role === 'ADMIN' ? <Schedule /> : <Navigate to="/" />} />
            <Route path="admin/rooms" element={role === 'ADMIN' ? <RoomManagement /> : <Navigate to="/" />} />
            <Route path="admin/bookings" element={role === 'ADMIN' ? <BookingsManagement /> : <Navigate to="/" />} />
            <Route path="admin/audit-logs" element={role === 'ADMIN' ? <AuditLogs /> : <Navigate to="/" />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;