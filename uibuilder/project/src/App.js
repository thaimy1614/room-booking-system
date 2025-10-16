import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import AvailableRooms from './pages/user/AvailableRooms';
import MyBookings from './pages/user/MyBookings';
import Schedule from './pages/user/Schedule';
import RoomManagement from './pages/admin/RoomManagement';
import BookingsManagement from './pages/admin/BookingsManagement';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#f50057' },
  },
});

function App() {
  const isLoggedIn = !!localStorage.getItem('token');
  const role = localStorage.getItem('role');

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/project/login" element={<Login />} />
          <Route path="/project/" element={isLoggedIn ? <DashboardLayout role={role} /> : <Navigate to="/project/login" />}>
            <Route index element={<Navigate to={role === 'ADMIN' ? '/project/admin/rooms' : '/project/available-rooms'} />} />
            <Route path="available-rooms" element={role === 'USER' || role === 'ADMIN' ? <AvailableRooms /> : <Navigate to="/project/" />} />
            <Route path="my-bookings" element={role === 'USER' || role === 'ADMIN' ? <MyBookings /> : <Navigate to="/" />} />
            <Route path="schedule" element={role === 'USER' || role === 'ADMIN' ? <Schedule /> : <Navigate to="/" />} />
            <Route path="admin/rooms" element={role === 'ADMIN' ? <RoomManagement /> : <Navigate to="/" />} />
            <Route path="admin/bookings" element={role === 'ADMIN' ? <BookingsManagement /> : <Navigate to="/" />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;