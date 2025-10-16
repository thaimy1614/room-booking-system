import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableHead, TableRow, TablePagination, CircularProgress, Snackbar, Alert, Chip, Box } from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { mockGetAllBookings, mockApproveBooking, mockRejectBooking, mockCancelBooking } from '../../mockData';

function BookingsManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openActionModal, setOpenActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reason, setReason] = useState('');
  const [roomId, setRoomId] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {
        room_id: roomId ? parseInt(roomId) : undefined,
        start_time: startTime ? startTime.toISOString() : undefined,
        end_time: endTime ? endTime.toISOString() : undefined,
        user_id: userId ? parseInt(userId) : undefined,
      };
      const { result } = await mockGetAllBookings(params);
      setBookings(result);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleAction = (booking, type) => {
    setSelectedBooking(booking);
    setActionType(type);
    setReason('');
    setOpenActionModal(true);
  };

  const submitAction = async () => {
    try {
      if (actionType === 'approve') {
        await mockApproveBooking(selectedBooking.booking_id);
      } else if (actionType === 'reject') {
        await mockRejectBooking(selectedBooking.booking_id, reason);
      } else if (actionType === 'cancel') {
        await mockCancelBooking(selectedBooking.booking_id, reason);
      }
      setOpenActionModal(false);
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
      <h4>Bookings Management</h4>
      <Form className="mb-4">
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField label="Room ID" type="number" value={roomId} onChange={(e) => setRoomId(e.target.value)} />
          <DateTimePicker label="Start Time" value={startTime} onChange={setStartTime} renderInput={(params) => <TextField {...params} />} />
          <DateTimePicker label="End Time" value={endTime} onChange={setEndTime} renderInput={(params) => <TextField {...params} />} />
          <TextField label="User ID" type="number" value={userId} onChange={(e) => setUserId(e.target.value)} />
          <Button variant="contained" onClick={fetchBookings}>Filter</Button>
        </Box>
      </Form>
      {loading ? <CircularProgress /> : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Start</TableCell>
              <TableCell>End</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(b => (
              <TableRow key={b.booking_id}>
                <TableCell>{b.title}</TableCell>
                <TableCell>{b.room?.name}</TableCell>
                <TableCell>{b.user?.full_name}</TableCell>
                <TableCell>{b.start_time}</TableCell>
                <TableCell>{b.end_time}</TableCell>
                <TableCell><Chip label={b.status} color={getStatusColor(b.status)} /></TableCell>
                <TableCell>
                  {b.status === 'PENDING' && (
                    <>
                      <Button variant="outlined" color="success" onClick={() => handleAction(b, 'approve')}>Approve</Button>
                      <Button variant="outlined" color="error" onClick={() => handleAction(b, 'reject')} sx={{ ml: 1 }}>Reject</Button>
                    </>
                  )}
                  {b.status === 'APPROVED' && <Button variant="outlined" color="secondary" onClick={() => handleAction(b, 'cancel')}>Cancel</Button>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <TablePagination component="div" count={bookings.length} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage} />
<Dialog 
  open={openActionModal} 
  onClose={() => {
    setOpenActionModal(false);
    setReason('');
  }}
  maxWidth="sm" 
  fullWidth
  PaperProps={{ sx: { minHeight: '200px' } }}
>
  <DialogTitle>{actionType.toUpperCase()} Booking</DialogTitle>
  <DialogContent dividers sx={{ pt: 3 }}>
    {['reject', 'cancel'].includes(actionType) && (
      <Box sx={{ mt: 2 }}>
        <TextField 
          label="Reason" 
          fullWidth 
          required
          value={reason} 
          onChange={(e) => {
            setReason(e.target.value);
          }}

          multiline
          rows={3}
          autoFocus
          InputLabelProps={{ shrink: true }}
        />
      </Box>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => {
      setOpenActionModal(false);
      setReason('');
    }}>
      Cancel
    </Button>
    <Button 
      onClick={submitAction} 
      variant="contained" 
      color={actionType === 'approve' ? 'success' : 'error'}
      disabled={['reject', 'cancel'].includes(actionType) && !reason.trim()}
    >
      Submit
    </Button>
  </DialogActions>
</Dialog>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}><Alert severity="error">{error}</Alert></Snackbar>
    </LocalizationProvider>
  );
}

export default BookingsManagement;