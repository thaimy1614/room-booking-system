import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Chip, 
  Box, 
  Button as MuiButton, 
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
  Alert 
} from '@mui/material';
import { handleGetAllFacilities } from '../../services/FacilityAPIs';
import { 
  handleGetRoomWithFilters, 
  handleGetRoomById, 
  handleCreateRoom, 
  handleUpdateRoom, 
  handleDeleteRoom 
} from '../../services/RoomAPIs';
import { toast } from 'react-toastify';
import useDebounce from '../../hooks/useDebounce';

function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
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
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);

  // Filter states
  const [filterName, setFilterName] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterMinCapacity, setFilterMinCapacity] = useState('');
  const [filterFacilityId, setFilterFacilityId] = useState('');

  // Debounced filter values
  const debouncedFilterName = useDebounce(filterName, 300);
  const debouncedFilterLocation = useDebounce(filterLocation, 300);

  useEffect(() => {
    const fetchFacilities = async () => {
      setFacilitiesLoading(true);
      try {
        const data = await handleGetAllFacilities();
        setFacilities(data.facilities || []);
      } catch (error) {
        toast.error('Failed to load facilities');
      } finally {
        setFacilitiesLoading(false);
      }
    };
    fetchRooms(); // Initial load
    fetchFacilities();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const filters = {
        limit: rowsPerPage,
        offset: page * rowsPerPage
      };
      if (debouncedFilterName.trim()) filters.name = debouncedFilterName.trim();
      if (debouncedFilterLocation.trim()) filters.location = debouncedFilterLocation.trim();
      const minCap = parseInt(filterMinCapacity, 10);
      if (!isNaN(minCap) && minCap >= 0) filters.min_capacity = minCap;
      if (filterFacilityId && filterFacilityId !== '') {
        filters.facility_id = parseInt(filterFacilityId, 10);
      }

      console.log('Sending filters:', filters); // DEBUG
      const data = await handleGetRoomWithFilters(filters);
      console.log('API response:', data); // DEBUG

      setRooms(data.result || []);
      setTotalCount(data.total_count || 0); // Set total count for pagination
    } catch (err) {
      toast.error(err.message || 'Failed to fetch rooms');
      setError(err.message || 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  // Fetch on page or rowsPerPage change
  useEffect(() => {
    fetchRooms();
  }, [page, rowsPerPage, debouncedFilterName, debouncedFilterLocation, filterMinCapacity, filterFacilityId]);

  const handleApplyFilters = () => {
    setPage(0); // Reset to first page
    fetchRooms();
  };

  const handleClearFilters = () => {
    setFilterName('');
    setFilterLocation('');
    setFilterMinCapacity('');
    setFilterFacilityId('');
    setPage(0);
    fetchRooms();
  };

  const handleCreate = () => {
    setIsUpdate(false);
    setName('');
    setCapacity('');
    setLocation('');
    setSelectedFacilities([]);
    setOpenModal(true);
  };

  const handleUpdate = async (roomId) => {
    try {
      const data = await handleGetRoomById(roomId);
      const room = data.result || data;
      setSelectedRoom(room);
      setName(room.name || '');
      setCapacity(room.capacity || '');
      setLocation(room.location || '');
      const facilityIds = room.facilities 
        ? room.facilities.map(f => f.facility_id || f.id) 
        : room.facility_ids || [];
      setSelectedFacilities(facilityIds);
      setIsUpdate(true);
      setOpenModal(true);
    } catch (err) {
      toast.error('Failed to load room details');
      setError(err.message);
    }
  };

  const submitRoom = async () => {
    if (!name.trim() || !capacity || !location.trim()) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      const payload = { 
        name: name.trim(), 
        capacity: parseInt(capacity, 10), 
        location: location.trim(), 
        facility_ids: selectedFacilities 
      };
      if (isUpdate) {
        await handleUpdateRoom(selectedRoom.room_id, payload);
        toast.success('Room updated successfully');
      } else {
        await handleCreateRoom(payload);
        toast.success('Room created successfully');
      }
      setOpenModal(false);
      fetchRooms();
    } catch (err) {
      toast.error(err.message || 'Failed to submit room');
      // setError(err.message);
    }
  };

  const handleDelete = (room) => {
    setSelectedRoom(room);
    setOpenDeleteModal(true);
  };

  const submitDelete = async () => {
    try {
      await handleDeleteRoom(selectedRoom.room_id);
      toast.success('Room deleted successfully');
      setOpenDeleteModal(false);
      fetchRooms();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getFacilityName = (id) => {
    const facility = facilities.find(f => f.facility_id === id || f.id === id);
    return facility?.name || 'Unknown';
  };

  const getRoomFacilitiesDisplay = (room) => {
    if (room.facilities && Array.isArray(room.facilities)) {
      return room.facilities.map(f => f.name || getFacilityName(f.facility_id)).join(', ');
    }
    if (room.facility_ids && Array.isArray(room.facility_ids)) {
      return room.facility_ids.map(id => getFacilityName(id)).join(', ');
    }
    return '';
  };

  return (
    <>
      <h4>Room Management</h4>
      
      {/* Filter Form */}
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        <TextField 
          label="Name" 
          value={filterName} 
          onChange={(e) => setFilterName(e.target.value)} 
          size="small" 
          sx={{ minWidth: 150 }}
        />
        <TextField 
          label="Location" 
          value={filterLocation} 
          onChange={(e) => setFilterLocation(e.target.value)} 
          size="small" 
          sx={{ minWidth: 150 }}
        />
        <TextField 
          label="Min Capacity" 
          type="number" 
          value={filterMinCapacity} 
          onChange={(e) => setFilterMinCapacity(e.target.value)} 
          size="small" 
          sx={{ width: 120 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Facility</InputLabel>
          <Select 
            value={filterFacilityId} 
            onChange={(e) => setFilterFacilityId(e.target.value)} 
            label="Facility"
          >
            <MenuItem value="">All</MenuItem>
            {facilities.map(f => (
              <MenuItem key={f.facility_id} value={f.facility_id}>
                {f.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <MuiButton variant="contained" onClick={handleApplyFilters}>
          Apply Filters
        </MuiButton>
        <MuiButton 
          variant="outlined" 
          color="secondary" 
          onClick={handleClearFilters}
        >
          Clear Filters
        </MuiButton>
      </Box>
      
      <MuiButton variant="contained" onClick={handleCreate} sx={{ mb: 2 }}>
        Create Room
      </MuiButton>
      
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
                <TableCell sx={{ fontWeight: 'bold' }}>Deleted</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No rooms found
                  </TableCell>
                </TableRow>
              ) : (
                rooms.map(room => (
                  <TableRow key={room.room_id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                    <TableCell>{room.name}</TableCell>
                    <TableCell>{room.capacity}</TableCell>
                    <TableCell>{room.location}</TableCell>
                    <TableCell>{getRoomFacilitiesDisplay(room)}</TableCell>
                    <TableCell>{room.is_deleted ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                    {!room.is_deleted && (
                      <MuiButton 
                        variant="outlined" 
                        size="small" 
                        onClick={() => handleUpdate(room.room_id)}
                      >
                        Update
                      </MuiButton>
                    )}
                      {!room.is_deleted && (
                        <MuiButton 
                          variant="outlined" 
                          color="error" 
                          size="small" 
                          onClick={() => handleDelete(room)} 
                          sx={{ ml: 1 }}
                        >
                          Delete
                        </MuiButton>
                      )}
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
            sx={{
                "& .MuiInputBase-root ": {
                    position: "relative",
                    top: "-6px"
                },
                "& .MuiTablePagination-actions ": {
                    position: "relative",
                    top: "-6px"
                },
          }}
          />
        </>
      )}
      
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isUpdate ? 'Update' : 'Create'} Room</DialogTitle>
        <DialogContent>
          {facilitiesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TextField 
                label="Name" 
                fullWidth 
                margin="normal" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required
              />
              <TextField 
                label="Capacity" 
                type="number" 
                fullWidth 
                margin="normal" 
                value={capacity} 
                onChange={(e) => setCapacity(e.target.value)} 
                required
              />
              <TextField 
                label="Location" 
                fullWidth 
                margin="normal" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                required
              />
              <FormControl fullWidth margin="normal">
                <InputLabel id="facilities-label">Facilities</InputLabel>
                <Select
                  multiple
                  value={selectedFacilities}
                  onChange={(e) => setSelectedFacilities(e.target.value)}
                  labelId="facilities-label"
                  label="Facilities"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={getFacilityName(value)} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {facilities.map(f => (
                    <MenuItem key={f.facility_id} value={f.facility_id}>
                      {f.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setOpenModal(false)}>Cancel</MuiButton>
          <MuiButton onClick={submitRoom} variant="contained">Submit</MuiButton>
        </DialogActions>
      </Dialog>
      
      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <DialogTitle>Delete Room</DialogTitle>
        <DialogContent>Are you sure you want to delete this room?</DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setOpenDeleteModal(false)}>Cancel</MuiButton>
          <MuiButton onClick={submitDelete} variant="contained" color="error">
            Delete
          </MuiButton>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}

export default RoomManagement;