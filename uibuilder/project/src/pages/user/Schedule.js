import React, { useState, useEffect } from 'react';
import { TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, Snackbar, Alert, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { mockGetSchedule, mockRooms } from '../../mockData';
dayjs.extend(isoWeek);

function RoomSchedule() {
  const [roomId, setRoomId] = useState('');
  const [weekStart, setWeekStart] = useState(dayjs().startOf('isoWeek')); // Monday
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8AM to 5PM
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    if (roomId) {
      fetchSchedule();
    }
  }, [roomId, weekStart]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const params = {
        room_id: roomId,
        start_time: weekStart.toISOString(),
        end_time: weekStart.add(5, 'day').endOf('day').toISOString(), // Mon to Sat
      };
      const { result } = await mockGetSchedule(params);
      setSchedule(result);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Handle week change: snap to Monday of selected week
  const handleWeekChange = (newValue) => {
    if (newValue) {
      setWeekStart(newValue.startOf('isoWeek'));
    }
  };

  // Week navigation
  const handlePrevWeek = () => setWeekStart(weekStart.subtract(7, 'day').startOf('isoWeek'));
  const handleNextWeek = () => setWeekStart(weekStart.add(7, 'day').startOf('isoWeek'));

  // Format week display
  const weekEnd = weekStart.add(5, 'day');
  const weekLabel = `${weekStart.format('DD/MM')} - ${weekEnd.format('DD/MM/YYYY')}`;

  // Generate date for each day column
  const weekDates = days.map((_, index) => weekStart.add(index, 'day'));

  // Mock rooms for select (assume mockRooms)
  const rooms = mockRooms || [];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <h4>Room Schedule</h4>
      <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Room</InputLabel>
          <Select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
            <MenuItem value="">Select Room</MenuItem>
            {rooms.map(room => (
              <MenuItem key={room.room_id} value={room.room_id}>{room.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <DatePicker
          label="Select Week"
          value={weekStart}
          onChange={handleWeekChange}
          format="DD/MM/YYYY"
          slotProps={{
            textField: {
              helperText: `Week: ${weekLabel} (Mon-Sat)`,
            },
          }}
          // Optional: disable masked input if needed
        />
        <Button variant="outlined" onClick={handlePrevWeek}>Prev Week</Button>
        <Button variant="outlined" onClick={handleNextWeek}>Next Week</Button>
        <Button variant="contained" onClick={fetchSchedule} disabled={!roomId}>Load Schedule</Button>
      </Box>
      {loading ? (
        <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />
      ) : (
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              {days.map((day, index) => (
                <TableCell key={day}>
                  {day}<br />
                  {weekDates[index].format('DD/MM')}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {hours.map(hour => (
              <TableRow key={hour}>
                <TableCell>{`${hour}:00`}</TableCell>
                {days.map((_, dayIndex) => {
                  const dateKey = weekDates[dayIndex].format('YYYY-MM-DD');
                  const bookings = schedule.filter(b => {
                    const bDate = dayjs(b.start_time).format('YYYY-MM-DD');
                    const bHour = dayjs(b.start_time).hour();
                    return bDate === dateKey && bHour === hour;
                  });
                  return (
                    <TableCell key={dayIndex}>
                      {bookings.map(b => (
                        <Box key={b.booking_id} sx={{ mb: 1, p: 1, backgroundColor: 'lightblue', borderRadius: 1 }}>
                          {b.title}<br />
                          {dayjs(b.start_time).format('HH:mm')} - {dayjs(b.end_time).format('HH:mm')}
                        </Box>
                      ))}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </LocalizationProvider>
  );
}

export default RoomSchedule;