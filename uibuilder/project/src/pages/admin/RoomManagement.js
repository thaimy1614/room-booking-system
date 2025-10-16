import React, { useState, useEffect } from 'react';
import { Button as BsButton } from 'react-bootstrap';
import { TextField, Select, MenuItem, FormControl, InputLabel, Chip, Box, OutlinedInput, Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableHead, TableRow, TablePagination, CircularProgress, Snackbar, Alert } from '@mui/material';
import { mockGetAllRooms, mockCreateRoom, mockUpdateRoom, mockDeleteRoom, mockGetRoomById, mockFacilities } from '../../mockData';

function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openModal, setOpenModal] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [location, setLocation] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const { result } = await mockGetAllRooms({});
      setRooms(result);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleCreate = () => {
    setIsUpdate(false);
    setName('');
    setCapacity('');
    setLocation('');
    setFacilities([]);
    setOpenModal(true);
  };

  const handleUpdate = async (roomId) => {
    try {
      const { result } = await mockGetRoomById(roomId);
      setSelectedRoom(result);
      setName(result.name);
      setCapacity(result.capacity);
      setLocation(result.location);
      setFacilities(result.facilities || []);
      setIsUpdate(true);
      setOpenModal(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const submitRoom = async () => {
    try {
      const data = { name, capacity: parseInt(capacity), location, facilities };
      if (isUpdate) {
        await mockUpdateRoom(selectedRoom.room_id, data);
      } else {
        await mockCreateRoom(data);
      }
      setOpenModal(false);
      fetchRooms();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = (room) => {
    setSelectedRoom(room);
    setOpenDeleteModal(true);
  };

  const submitDelete = async () => {
    try {
      await mockDeleteRoom(selectedRoom.room_id);
      setOpenDeleteModal(false);
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

  return (
    <>
      <h4>Room Management</h4>
      <Button variant="contained" onClick={handleCreate} sx={{ mb: 2 }}>Create Room</Button>
      {loading ? <CircularProgress /> : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Facilities</TableCell>
              <TableCell>Deleted</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(room => (
              <TableRow key={room.room_id}>
                <TableCell>{room.name}</TableCell>
                <TableCell>{room.capacity}</TableCell>
                <TableCell>{room.location}</TableCell>
                <TableCell>{room.facilities?.map(f => f.name).join(', ')}</TableCell>
                <TableCell>{room.is_deleted ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <Button variant="outlined" onClick={() => handleUpdate(room.room_id)}>Update</Button>
                  {!room.is_deleted && <Button variant="outlined" color="secondary" onClick={() => handleDelete(room)} sx={{ ml: 1 }}>Delete</Button>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <TablePagination component="div" count={rooms.length} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage} />
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>{isUpdate ? 'Update' : 'Create'} Room</DialogTitle>
        <DialogContent>
          <TextField label="Name" fullWidth margin="normal" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Capacity" type="number" fullWidth margin="normal" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
          <TextField label="Location" fullWidth margin="normal" value={location} onChange={(e) => setLocation(e.target.value)} />
          <FormControl fullWidth margin="normal">
            <InputLabel>Facilities</InputLabel>
            <Select multiple value={facilities} onChange={(e) => setFacilities(e.target.value)} input={<OutlinedInput />} renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => <Chip key={value} label={mockFacilities.find(f => f.facility_id === value)?.name} />)}
              </Box>
            )}>
              {mockFacilities.map(f => <MenuItem key={f.facility_id} value={f.facility_id}>{f.name}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button onClick={submitRoom} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <DialogTitle>Delete Room</DialogTitle>
        <DialogContent>Are you sure?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteModal(false)}>No</Button>
          <Button onClick={submitDelete} variant="contained" color="secondary">Yes</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}><Alert severity="error">{error}</Alert></Snackbar>
    </>
  );
}

export default RoomManagement;