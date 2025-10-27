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
} from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import useDebounce from '../../hooks/useDebounce';
import {
  handleGetAuditLogsWithFilters,
} from '../../services/AuditLogAPIs';

function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter states
  const [filterRoomName, setFilterRoomName] = useState('');
  const [filterUsername, setFilterUsername] = useState('');
  const [filterStartTime, setFilterStartTime] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const debouncedFilterRoomName = useDebounce(filterRoomName, 300);
  const debouncedFilterUsername = useDebounce(filterUsername, 300);

  useEffect(() => {
    fetchAuditLogs();
  }, [page, rowsPerPage, debouncedFilterRoomName, debouncedFilterUsername, filterUsername, filterStartTime, filterStatus]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const filters = {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      };
      if (debouncedFilterRoomName.trim()) filters.room_name = debouncedFilterRoomName.trim();
      if (debouncedFilterUsername.trim()) filters.username = debouncedFilterUsername.trim();
      if (filterStartTime) filters.start_time = dayjs(filterStartTime).toISOString();
      if (filterStatus) filters.status = filterStatus;

      console.log('Sending filters:', filters);
      const data = await handleGetAuditLogsWithFilters(filters);
      console.log('API response:', data);

      if (data.result.length === 0 && data.total_count > 0) {
        setPage(0); // Reset to first page if empty results but count exists
      } else {
        setAuditLogs(data.result || []);
        setTotalCount(data.total_count || 0);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch auditLogs');
      setError(err.message || 'Failed to fetch auditLogs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REJECTED':
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
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
    setFilterRoomName('');
    setFilterStartTime(null);
    setFilterStatus('');
    setPage(0);
    fetchAuditLogs();
  };
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
      <h4>Audit Logs Management</h4>
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        <TextField
          label="Room Name"
          value={filterRoomName}
          onChange={(e) => setFilterRoomName(e.target.value)}
          size="small"
          sx={inputSx}
        />
        <TextField
          label="Username"
          value={filterUsername}
          onChange={(e) => setFilterUsername(e.target.value)}
          size="small"
          sx={inputSx}
        />
        <DateTimePicker
          label="Start Time"
          value={filterStartTime}
          onChange={setFilterStartTime}
          views={['year', 'month', 'day', 'hours']}
          format="YYYY-MM-DD HH:00"
          slotProps={{
            textField: {
              size: 'small',
              sx: inputSx,
            },
          }}
        />
        <FormControl size="small" sx={inputSx}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Status"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="APPROVED">Approved</MenuItem>
            <MenuItem value="REJECTED">Rejected</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={fetchAuditLogs}>
          Apply Filters
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleClearFilters}>
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
                <TableCell sx={{ fontWeight: 'bold' }}>Room</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Start</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>End</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Action By</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Action At</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Action Reason</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {auditLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                auditLogs.map((b) => (
                  <TableRow key={b.auditLog_id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                    <TableCell>{b.room_name}</TableCell>
                    <TableCell>{b.username}</TableCell>
                    <TableCell>{dayjs(b.start_time).format('YYYY-MM-DD HH:mm')}</TableCell>
                    <TableCell>{dayjs(b.end_time).format('YYYY-MM-DD HH:mm')}</TableCell>
                    <TableCell>
                      <Chip label={b.status} color={getStatusColor(b.status)} />
                    </TableCell>
                    <TableCell>{b.status !== 'PENDING' ? b.action_by || 'N/A' : '-'}</TableCell>
                    <TableCell>
                      {b.status !== 'PENDING' && b.action_at
                        ? dayjs(b.action_at).format('YYYY-MM-DD HH:mm')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {b.status !== 'APPROVED' && b.status !== 'PENDING' ? b.action_reason || 'N/A' : '-'}
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
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
}

export default AuditLogs;