/* global uibuilder */
import React, { useState, useEffect, use } from 'react';
import { toast } from 'react-toastify';
import {
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  OutlinedInput,
} from '@mui/material';
import { LocalizationProvider, DatePicker, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { handleGetActiveRooms } from '../../services/RoomAPIs';
import { handleGetSchedulesOfRoom } from '../../services/ScheduleAPIs';
import { handleCreateBooking } from '../../services/BookingAPIs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import uibuilderSocket from '../../configs/uibuilderSocket';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);
dayjs.tz.setDefault('Asia/Ho_Chi_Minh');

function RoomSchedule() {
  const now = dayjs();
  const defaultStart = now.add(1, 'hour').minute(0).second(0).millisecond(0);
  const defaultEnd = defaultStart.add(1, 'hour');

  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(defaultEnd);
  const [roomId, setRoomId] = useState('');
  const [weekStart, setWeekStart] = useState(dayjs().startOf('isoWeek')); // Monday
  console.log('Initial weekStart:', weekStart.format(), defaultEnd.format(), defaultStart.format());
  const [schedule, setSchedule] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [bookingTitle, setBookingTitle] = useState('');

  const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8AM to 5PM
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


  uibuilder.onChange('msg', (msg) => {
    // need to check weekStart and weekEnd to see if the updated booking affects current schedule
    if (msg.topic === 'schedule-update' && msg.room_id === roomId && dayjs(msg.payload.start_time).isBetween(weekStart, weekStart.add(5, 'day').endOf('day'))) {
      console.log('Received schedule update:', msg.topic);
      setSchedule((prevSchedule) => {
        const updatedBooking = msg.payload;
        const existingIndex = prevSchedule.findIndex(b => b.booking_id === updatedBooking.booking_id);
        let newSchedule = [...prevSchedule];
        if (updatedBooking.status === 'CANCELLED' || updatedBooking.status === 'REJECTED') {
          // Remove booking from schedule
          if (existingIndex !== -1) {
            newSchedule.splice(existingIndex, 1);
          }
        } else {
          if (existingIndex !== -1) {
            // Update existing booking
            newSchedule[existingIndex] = updatedBooking;
          } else {
            // Add new booking
            newSchedule.push(updatedBooking);
          }
        }
        return newSchedule;
      });
    }
  });

  //if after receive socket message, then fetch schedule but user current selectedslots should remain but remove those that are now booked
  useEffect(() => {
    if (selectedSlots.length === 0) return;
    const bookedSlots = schedule.map(b => {
      const bDate = dayjs(b.start_time).format('YYYY-MM-DD');
      const bHour = dayjs(b.start_time).hour();
      const bEndHour = dayjs(b.end_time).hour();
      const slots = [];
      for (let h = bHour; h < bEndHour; h++) {
        slots.push(`${bDate}:${h}`);
      }
      return slots;
    }).flat();
    const newSelectedSlots = selectedSlots.filter(slot => !bookedSlots.includes(slot));
    setSelectedSlots(newSelectedSlots);
    setStartTime(newSelectedSlots.length > 0 ? dayjs(`${newSelectedSlots[0].split(':')[0]}T${parseInt(newSelectedSlots[0].split(':')[1], 10)}:00:00`) : null);
    setEndTime(newSelectedSlots.length > 0 ? dayjs(`${newSelectedSlots[newSelectedSlots.length - 1].split(':')[0]}T${parseInt(newSelectedSlots[newSelectedSlots.length - 1].split(':')[1], 10) + 1}:00:00`) : null);
  }, [schedule]);

  // Fetch active rooms on mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await handleGetActiveRooms();
        setRooms(response.result || []);
        setRoomId(response.result[0]?.room_id || '');
      } catch (err) {
        setError(err.message || 'Failed to fetch rooms');
      }
    };
    fetchRooms();
  }, []);

  // Fetch schedule when roomId or weekStart changes
  useEffect(() => {
    if (roomId) {
      fetchSchedule();
    } else {
      setSchedule([]); // Clear schedule if no room is selected
    }
  }, [roomId, weekStart]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const params = {
        room_id: roomId,
        start_time: weekStart.toISOString(),
        end_time: weekStart.add(5, 'day').endOf('day').toISOString(),
      };
      console.log('Fetching schedule with params:', params);
      const res = await handleGetSchedulesOfRoom(params);
      const filteredResult = res.result.filter(b => ['APPROVED', 'PENDING'].includes(b.status));
      setSchedule(filteredResult || []);
    } catch (err) {
      setSchedule([]);
      setError(err.message || 'Failed to fetch schedule');
    }
    setLoading(false);
  };

  // Handle week change: snap to Monday of selected week
  const handleWeekChange = (newValue) => {
    if (newValue) {
      setWeekStart(newValue.startOf('isoWeek'));
      setSelectedSlots([]); // Reset selection on week change
    }
  };

  // Week navigation
  const handlePrevWeek = () => {
    setWeekStart(weekStart.subtract(7, 'day').startOf('isoWeek'));
    setSelectedSlots([]); // Reset selection
  };
  const handleNextWeek = () => {
    setWeekStart(weekStart.add(7, 'day').startOf('isoWeek'));
    setSelectedSlots([]); // Reset selection
  };

  const handleClearSelection = () => {
    setSelectedSlots([]);
    setStartTime(null);
    setEndTime(null);
  }

  const handleSlotClick = (date, hour) => {
    // cannot book if date or hour is before current time
    if (!roomId || date.hour(hour).isBefore(dayjs()) || date.isBefore(dayjs(), 'day')) return;
    const slotKey = `${date.format('YYYY-MM-DD')}:${hour}`;
    console.log('Clicked slot:', slotKey);
    const isBooked = schedule.some(b => {
      const bDate = dayjs(b.start_time).format('YYYY-MM-DD');
      const bHour = dayjs(b.start_time).hour();
      const bEndHour = dayjs(b.end_time).hour();
      return bDate === date.format('YYYY-MM-DD') && hour >= bHour && hour < bEndHour;
    });

    if (isBooked) return;

    let newSlots = [...selectedSlots];

    if (newSlots.length === 0) {
      newSlots = [slotKey];
    } else {
      const sortedSlots = [...newSlots].sort((a, b) => {
        const hourA = parseInt(a.split(':')[1], 10);
        const hourB = parseInt(b.split(':')[1], 10);
        return hourA - hourB;
      });
      const [firstDateStr, firstHourStr] = sortedSlots[0].split(':');
      const [lastDateStr, lastHourStr] = sortedSlots[sortedSlots.length - 1].split(':');
      const firstDate = dayjs(firstDateStr);
      const lastDate = dayjs(lastDateStr);
      const firstHour = parseInt(firstHourStr, 10);
      const lastHour = parseInt(lastHourStr, 10);
      const clickedDate = date;

      if (!clickedDate.isSame(firstDate, 'day')) {
        setError('All slots must be on the same day');
        return;
      }

      if (newSlots.includes(slotKey)) {
        if (slotKey === sortedSlots[0]) {
          newSlots = sortedSlots.slice(1);
        } else if (slotKey === sortedSlots[sortedSlots.length - 1]) {
          newSlots = sortedSlots.slice(0, -1);
        } else {
          setError('You can only unselect from the start or end of the range');
          return;
        }
      } else {
        const isAdjacent =
          (hour === firstHour - 1 || hour === lastHour + 1) &&
          clickedDate.isSame(firstDate, 'day');
        if (isAdjacent) {
          newSlots.push(slotKey);
        } else {
          setError('Please select continuous time slots (adjacent hours on the same day)');
          return;
        }
      }
    }

    setSelectedSlots(newSlots.sort((a, b) => {
      const hourA = parseInt(a.split(':')[1], 10);
      const hourB = parseInt(b.split(':')[1], 10);
      return hourA - hourB;
    }));

    if (newSlots.length === 0) {
      setStartTime(null);
      setEndTime(null);
    } else {
      const sortedSlots = [...newSlots].sort((a, b) => {
        const hourA = parseInt(a.split(':')[1], 10);
        const hourB = parseInt(b.split(':')[1], 10);
        return hourA - hourB;
      });
      const [firstDate, firstHour] = sortedSlots[0].split(':');
      const [lastDate, lastHour] = sortedSlots[sortedSlots.length - 1].split(':');
      const startTime = dayjs(`${firstDate}T${parseInt(firstHour, 10)}:00:00`);
      const endTime = dayjs(`${lastDate}T${parseInt(lastHour, 10) + 1}:00:00`);
      setStartTime(startTime);
      setEndTime(endTime);
    }
  };

  // Handle booking submission
  const handleBook = async () => {
    if (selectedSlots.length === 0) {
      toast.error('Please select at least one time slot');
      return;
    }
    if (!bookingTitle.trim()) {
      toast.error('Booking title is required');
      return;
    }

    try {
      // Calculate start and end times from selected slots
      const sortedSlots = selectedSlots.sort();
      const [firstDate, firstHour] = sortedSlots[0].split(':');
      const [lastDate, lastHour] = sortedSlots[sortedSlots.length - 1].split(':');
      const startTime = dayjs(`${firstDate}T${firstHour}:00:00`);
      const endTime = dayjs(`${lastDate}T${parseInt(lastHour, 10) + 1}:00:00`);

      const bookingData = {
        room_id: roomId,
        title: bookingTitle,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
      };

      await handleCreateBooking(bookingData);
      toast.success('Booking created successfully');
      setOpenBookingDialog(false);
      setSelectedSlots([]);
      setBookingTitle('');
      fetchSchedule();
    } catch (err) {
      toast.error(err.message || 'Failed to create booking');
    }
  };

  // Format week display
  const weekEnd = weekStart.add(5, 'day');
  const weekLabel = `${weekStart.format('DD/MM')} - ${weekEnd.format('DD/MM/YYYY')}`;

  // Generate date for each day column
  const weekDates = days.map((_, index) => weekStart.add(index, 'day'));
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
      <h4>Room Schedule</h4>
      <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl size="small" sx={inputSx}>
          <InputLabel>Room</InputLabel>
          <Select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            label="Status"
          >
            <MenuItem value="">All</MenuItem>
            {rooms.map(room => (
              <MenuItem key={room.room_id} value={room.room_id}>
                {room.name}
              </MenuItem>
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
              size: 'small',
              sx: inputSx,
              // helperText: `Week: ${weekLabel} (Mon-Sat)`,
            },
          }}
        />
        <Button variant="outlined" onClick={handlePrevWeek}>Prev Week</Button>
        <Button variant="outlined" onClick={handleNextWeek}>Next Week</Button>
        {selectedSlots.length > 0 && (
          <Button
            variant="contained"
            color="success"
            onClick={() => setOpenBookingDialog(true)}
          >
            Book
          </Button>
        )}
        {selectedSlots.length > 0 && (
          <Button
            variant="outlined"
            onClick={handleClearSelection}
          >
            Clear Selection
          </Button>
        )}
        {/* // notify light gray for pending, green for approved */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 'auto' }}>
          <Chip label="Approved" sx={{ backgroundColor: '#c8e6c9' }} />
          <Chip label="Pending" sx={{ backgroundColor: '#e0e0e0' }} />
          <Chip label="Selected" sx={{ backgroundColor: '#90EE90' }} />
        </Box>
      </Box>
      {loading ? (
        <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />
      ) : (
        <Table stickyHeader sx={{ minWidth: 650, border: '1px solid #e0e0e0' }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
              {days.map((day, index) => (
                <TableCell key={day} sx={{ fontWeight: 'bold' }}>
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
                  const date = weekDates[dayIndex];
                  const dateKey = date.format('YYYY-MM-DD');
                  const slotKey = `${dateKey}:${hour}`;
                  const bookings = schedule.filter(b => {
                    const bDate = dayjs(b.start_time).format('YYYY-MM-DD');
                    const bHour = dayjs(b.start_time).hour();
                    //also check end time to cover multi-hour bookings
                    const bEndHour = dayjs(b.end_time).hour();
                    return bDate === dateKey && hour >= bHour && hour < bEndHour;
                  });
                  const isBooked = bookings.length > 0;
                  const isSelected = selectedSlots.includes(slotKey);


                  // Determine background color based on booking status
                  const backgroundColor = isBooked
                    ? bookings[0]?.status === 'APPROVED'
                      ? '#c8e6c9' // Green for APPROVED
                      : '#e0e0e0' // Light gray for PENDING
                    : isSelected
                      ? '#90EE90' // Selected slot color
                      : 'transparent';

                  return (
                    <TableCell
                      key={dayIndex}
                      onClick={() => handleSlotClick(date, hour)}
                      sx={{
                        // cannot book day or hour that is before current time
                        cursor: !roomId || date.hour(hour).isBefore(dayjs()) || isBooked || date.isBefore(dayjs(), 'day') ? 'not-allowed' : 'pointer',
                        backgroundColor,
                        '&:hover': {
                          backgroundColor: isBooked
                            ? bookings[0]?.status === 'APPROVED'
                              ? '#b2d8b2' // Slightly darker green for APPROVED hover
                              : '#d0d0d0' // Slightly darker gray for PENDING hover
                            : isSelected
                              ? '#78DA78' // Selected hover
                              : '#f0f0f0', // Non-selected hover
                        },
                      }}
                    >
                      {/* {bookings.map(b => (
                        <Box
                          key={b.booking_id}
                          sx={{
                            mb: 1,
                            p: 1,
                            backgroundColor: 'transparent', // Transparent to show TableCell background
                            borderRadius: 1,
                          }}
                        >
                          {dayjs(b.start_time).format('HH:mm')} - {dayjs(b.end_time).format('HH:mm')}
                          <br />
                        </Box>
                      ))} */}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog
        open={openBookingDialog}
        onClose={() => {
          setOpenBookingDialog(false);
          setBookingTitle('');
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { minHeight: '200px' } }}
      >
        <DialogTitle>Create Booking</DialogTitle>
        <DialogContent dividers sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              fullWidth
              required
              value={bookingTitle}
              onChange={(e) => setBookingTitle(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <DateTimePicker
              label="Start Time"
              value={startTime}
              views={['year', 'month', 'day', 'hours']}
              format="YYYY-MM-DD HH:00"
              ampm={false}
              disabled
              slotProps={{
                textField: { size: 'small', sx: inputSx },
              }}
            />
            <DateTimePicker
              label="End Time"
              value={endTime}
              views={['year', 'month', 'day', 'hours']}
              format="YYYY-MM-DD HH:00"
              ampm={false}
              disabled
              slotProps={{
                textField: { size: 'small', sx: inputSx },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenBookingDialog(false);
              setBookingTitle('');
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBook}
            variant="contained"
            color="success"
            disabled={!bookingTitle.trim()}
          >
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

export default RoomSchedule;