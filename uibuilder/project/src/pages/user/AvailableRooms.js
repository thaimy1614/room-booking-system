import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
} from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import useDebounce from '../../hooks/useDebounce';
import {
  handleGetAvailableRooms,
} from '../../services/RoomAPIs';
import { handleCreateBooking } from '../../services/BookingAPIs';
import { handleGetAllFacilities } from '../../services/FacilityAPIs';

function AvailableRooms() {
  // Default: start at next whole hour, end +1 hour
  const now = dayjs();
  const defaultStart = now.add(1, 'hour').minute(0).second(0).millisecond(0);
  const defaultEnd = defaultStart.add(1, 'hour');

  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(defaultEnd);
  const [minCapacity, setMinCapacity] = useState('');
  const [facilityId, setFacilityId] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openBookModal, setOpenBookModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [title, setTitle] = useState('');

  const debouncedMinCapacity = useDebounce(minCapacity, 300);

  useEffect(() => {
    fetchFacilities();
    fetchRooms();
  }, [page, rowsPerPage, startTime, endTime, debouncedMinCapacity, facilityId]);

  const fetchFacilities = async () => {
    try {
      const data = await handleGetAllFacilities();
      setFacilities(data.facilities || []);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch facilities');
    }
  };

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params = {
        start_time: startTime ? startTime.toISOString() : undefined,
        end_time: endTime ? endTime.toISOString() : undefined,
        min_capacity: debouncedMinCapacity ? parseInt(debouncedMinCapacity, 10) : undefined,
        facility_id: facilityId.length > 0 ? facilityId[0] : undefined,
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      };
      const data = await handleGetAvailableRooms(params);
      if (data.result.length === 0 && data.total_count > 0) {
        setPage(0); // Reset to first page if empty results but count exists
      } else {
        setRooms(data.result || []);
        setTotalCount(data.total_count || 0);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch available rooms');
      setError(err.message || 'Failed to fetch available rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (room) => {
    setSelectedRoom(room);
    setOpenBookModal(true);
  };

  const submitBooking = async () => {
    try {
      if (!startTime || !endTime) {
        throw new Error('Start and end times are required');
      }
      if (startTime.minute() !== 0 || endTime.minute() !== 0) {
        throw new Error('Booking times must be on the whole hour');
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
      await handleCreateBooking(data);
      toast.success('Booking created successfully');
      setOpenBookModal(false);
      setTitle('');
      fetchRooms();
    } catch (err) {
      toast.error(err.message || 'Failed to create booking');
      setError(err.message || 'Failed to create booking');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClearFilters = () => {
    setStartTime(defaultStart);
    setEndTime(defaultEnd);
    setMinCapacity('');
    setFacilityId([]);
    setPage(0);
    fetchRooms();
  };

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

  // Consistent styling for filter inputs
  const inputSx = {
    minWidth: 150,
    '& .MuiInputBase-root': {
      height: 40,
    },
    '& .MuiInputLabel-root': {
    },
    '& .MuiOutlinedInput-root': {
      paddingRight: '8px',
    },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <h4>Available Rooms</h4>
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        <DateTimePicker
          label="Start Time"
          value={startTime}
          onChange={handleStartChange}
          views={['year', 'month', 'day', 'hours']}
          format="YYYY-MM-DD HH:00"
          ampm={false}
          slotProps={{
            textField: {
              size: 'small',
              sx: inputSx,
              // helperText: 'Whole hours only',
            },
          }}
        />
        <DateTimePicker
          label="End Time"
          value={endTime}
          onChange={handleEndChange}
          views={['year', 'month', 'day', 'hours']}
          format="YYYY-MM-DD HH:00"
          ampm={false}
          slotProps={{
            textField: {
              size: 'small',
              sx: inputSx,
              // helperText: 'Whole hours only',
            },
          }}
        />
        <TextField
          label="Min Capacity"
          type="number"
          value={minCapacity}
          onChange={(e) => setMinCapacity(e.target.value)}
          size="small"
          sx={inputSx}
        />
        <FormControl size="small" sx={{ ...inputSx, minWidth: 200 }}>
          <InputLabel>Facilities</InputLabel>
          <Select
            multiple
            value={facilityId}
            onChange={(e) => setFacilityId(e.target.value)}
            input={<OutlinedInput label="Facilities" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip
                    key={value}
                    label={facilities.find((f) => f.facility_id === value)?.name || 'Unknown'}
                  />
                ))}
              </Box>
            )}
          >
            {facilities.map((f) => (
              <MenuItem key={f.facility_id} value={f.facility_id}>
                {f.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={fetchRooms} sx={{ height: 40 }}>
          Apply Filters
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleClearFilters}
          sx={{ height: 40 }}
        >
          Clear Filters
        </Button>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Table sx={{ minWidth: 650, border: '1px solid #e0e0e0' }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Capacity</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Facilities</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No available rooms found
                  </TableCell>
                </TableRow>
              ) : (
                rooms.map((room) => (
                  <TableRow key={room.room_id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                    <TableCell>{room.name}</TableCell>
                    <TableCell>{room.capacity}</TableCell>
                    <TableCell>{room.location}</TableCell>
                    <TableCell>{room.facilities?.map((f) => f.name).join(', ') || 'None'}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleBook(room)}
                      >
                        Book
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Rows per page:"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} of ${count}`}
            sx={{
              "& .MuiInputBase-root ": {
                position: "relative",
                top: "-7px"
              },
              "& .MuiTablePagination-actions ": {
                position: "relative",
                top: "-8px"
              },
            }}
          />
        </>
      )}
      <Dialog
        open={openBookModal}
        onClose={() => {
          setOpenBookModal(false);
          setTitle('');
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { minHeight: '200px' } }}
      >
        <DialogTitle>Book Room: {selectedRoom?.name}</DialogTitle>
        <DialogContent dividers sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              fullWidth
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <DateTimePicker
              label="Start Time"
              value={startTime}
              onChange={handleStartChange}
              views={['year', 'month', 'day', 'hours']}
              format="YYYY-MM-DD HH:00"
              ampm={false}
              disabled
              slotProps={{
                // textField: { size: 'small', helperText: 'Whole hours only' },
              }}
            />
            <DateTimePicker
              label="End Time"
              value={endTime}
              onChange={handleEndChange}
              views={['year', 'month', 'day', 'hours']}
              format="YYYY-MM-DD HH:00"
              ampm={false}
              disabled
              slotProps={{
                // textField: { size: 'small', helperText: 'Whole hours only' },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenBookModal(false);
              setTitle('');
            }}
          >
            Cancel
          </Button>
          <Button onClick={submitBooking} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
}

export default AvailableRooms;