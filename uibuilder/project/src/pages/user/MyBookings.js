import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { TextField, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableHead, TableRow, TablePagination, CircularProgress, Snackbar, Alert, Chip, Box, FormControl, InputLabel } from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { mockGetMyBookings, mockCancelMyBooking } from '../../mockData';

function MyBookings() {
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [status, setStatus] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openCancelModal, setOpenCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {
        start_time: startTime ? startTime.toISOString() : undefined,
        end_time: endTime ? endTime.toISOString() : undefined,
        status,
      };
      const { result } = await mockGetMyBookings(params);
      setBookings(result);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleCancel = (booking) => {
    setSelectedBooking(booking);
    setOpenCancelModal(true);
  };

  const submitCancel = async () => {
    try {
      await mockCancelMyBooking(selectedBooking.booking_id);
      setOpenCancelModal(false);
      fetchBookings();
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (stat) => {
    if (stat === 'APPROVED') return 'success';
    if (stat === 'PENDING') return 'warning';
    return 'error';
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <h4>My Bookings</h4>
      <Form className="mb-4">
        <Box sx={{ display: 'flex', gap: 2 }}>
          <DateTimePicker label="Start Time" value={startTime} onChange={setStartTime} renderInput={(params) => <TextField {...params} />} />
          <DateTimePicker label="End Time" value={endTime} onChange={setEndTime} renderInput={(params) => <TextField {...params} />} />
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="PENDING">PENDING</MenuItem>
              <MenuItem value="APPROVED">APPROVED</MenuItem>
              <MenuItem value="REJECTED">REJECTED</MenuItem>
              <MenuItem value="CANCELLED">CANCELLED</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={fetchBookings}>Filter</Button>
        </Box>
      </Form>
      {loading ? <CircularProgress /> : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Start</TableCell>
              <TableCell>End</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(b => (
              <TableRow key={b.booking_id}>
                <TableCell>{b.title}</TableCell>
                <TableCell>{b.room?.name}</TableCell>
                <TableCell>{b.start_time}</TableCell>
                <TableCell>{b.end_time}</TableCell>
                <TableCell><Chip label={b.status} color={getStatusColor(b.status)} /></TableCell>
                <TableCell>{b.status === 'PENDING' && <Button variant="outlined" color="secondary" onClick={() => handleCancel(b)}>Cancel</Button>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <TablePagination component="div" count={bookings.length} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage} />
      <Dialog open={openCancelModal} onClose={() => setOpenCancelModal(false)}>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>Are you sure?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelModal(false)}>No</Button>
          <Button onClick={submitCancel} variant="contained" color="secondary">Yes</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}><Alert severity="error">{error}</Alert></Snackbar>
    </LocalizationProvider>
  );
}

export default MyBookings;