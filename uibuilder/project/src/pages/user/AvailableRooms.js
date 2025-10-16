import React, { useState, useEffect } from 'react';
import { TextField, Select, MenuItem, FormControl, InputLabel, Chip, Box, OutlinedInput, Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableHead, TableRow, TablePagination, CircularProgress, Snackbar, Alert } from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { mockGetAvailableRooms, mockCreateBooking, mockFacilities } from '../../mockData';

function AvailableRooms() {
  // Default: start at current whole hour, end +1 hour
  const now = dayjs();
  const defaultStart = now.minute(0).second(0).millisecond(0);
  const defaultEnd = defaultStart.add(1, 'hour');
  
  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(defaultEnd);
  const [minCapacity, setMinCapacity] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openBookModal, setOpenBookModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [title, setTitle] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      // Ensure whole hours for search
      const searchStart = startTime.minute(0);
      const searchEnd = endTime.minute(0);
      const params = {
        start_time: searchStart.toISOString(),
        end_time: searchEnd.toISOString(),
        min_capacity: minCapacity ? parseInt(minCapacity) : undefined,
        facilities,
      };
      const { result } = await mockGetAvailableRooms(params);
      setRooms(result);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleBook = (room) => {
    setSelectedRoom(room);
    setOpenBookModal(true);
  };

  const submitBooking = async () => {
    try {
      // Validate whole hours
      if (startTime.minute() !== 0 || endTime.minute() !== 0) {
        throw new Error('Booking times must be on the whole hour (e.g., 5:00, 6:00)');
      }
      if (!dayjs(endTime).isAfter(startTime)) {
        throw new Error('End time must be after start time');
      }
      if (!title.trim()) {
        throw new Error('Title is required');
      }
      const data = {
        room_id: selectedRoom.room_id,
        title,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
      };
      await mockCreateBooking(data);
      setOpenBookModal(false);
      setTitle('');
      fetchRooms();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Custom handler to snap to whole hours
  const handleStartChange = (newValue) => {
    if (newValue) {
      setStartTime(newValue.minute(0).second(0).millisecond(0));
    }
  };

  const handleEndChange = (newValue) => {
    if (newValue) {
      setEndTime(newValue.minute(0).second(0).millisecond(0));
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <h4>Available Rooms</h4>
      <Box className="mb-4" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <DateTimePicker 
          label="Start Time" 
          value={startTime} 
          onChange={handleStartChange}
          views={['year', 'month', 'day', 'hours']}
          format="YYYY-MM-DD HH:00"
          ampm={false}
        //   slotProps={{ textField: { helperText: 'Whole hours only' } }}
        />
        <DateTimePicker 
          label="End Time" 
          value={endTime} 
          onChange={handleEndChange}
          views={['year', 'month', 'day', 'hours']}
          format="YYYY-MM-DD HH:00"
          ampm={false}
        //   slotProps={{ textField: { helperText: 'Whole hours only' } }}
        />
        <TextField 
          label="Min Capacity" 
          type="number" 
          value={minCapacity} 
          onChange={(e) => setMinCapacity(e.target.value)} 
          sx={{ width: 150 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Facilities</InputLabel>
          <Select 
            multiple 
            value={facilities} 
            onChange={(e) => setFacilities(e.target.value)} 
            input={<OutlinedInput label="Facilities" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={mockFacilities.find(f => f.facility_id === value)?.name || 'Unknown'} />
                ))}
              </Box>
            )}
          >
            {mockFacilities.map(f => (
              <MenuItem key={f.facility_id} value={f.facility_id}>{f.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={fetchRooms}>Search</Button>
      </Box>
      {loading ? (
        <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Facilities</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rooms.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(room => (
                <TableRow key={room.room_id}>
                  <TableCell>{room.name}</TableCell>
                  <TableCell>{room.capacity}</TableCell>
                  <TableCell>{room.location}</TableCell>
                  <TableCell>{room.facilities?.map(f => f.name).join(', ') || 'None'}</TableCell>
                  <TableCell>
                    <Button variant="outlined" size="small" onClick={() => handleBook(room)}>Book</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rooms.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
      <Dialog open={openBookModal} onClose={() => setOpenBookModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Book Room: {selectedRoom?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Title" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} />
            <DateTimePicker 
              label="Start Time" 
              value={startTime} 
              onChange={handleStartChange}
              views={['year', 'month', 'day', 'hours']}
              format="YYYY-MM-DD HH:00"
              ampm={false}
              disabled
            />
            <DateTimePicker 
              label="End Time" 
              value={endTime} 
              onChange={handleEndChange}
              views={['year', 'month', 'day', 'hours']}
              format="YYYY-MM-DD HH:00"
              ampm={false}
              disabled
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBookModal(false)}>Cancel</Button>
          <Button onClick={submitBooking} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </LocalizationProvider>
  );
}

export default AvailableRooms;