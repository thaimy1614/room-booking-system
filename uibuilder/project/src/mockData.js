// Updated mockData.js - Full corrected version
// Fixes:
// - All mock functions now async (return Promise) to support await properly.
// - Consistent facilities handling: list APIs return objects with name, detail/edit APIs return ids.
// - Added .filter(Boolean) to avoid undefined in facilities map.
// - Fixed typo in mockUpdateRoom message ('Room created' -> 'Room updated').
// - Added params handling stubs where needed (room_id, etc. filters).
// - In mockGetAllBookings, added basic filters for params.
// - In mockGetSchedule, removed async if not needed but kept for consistency.
// - Ensured nextId increments correctly.
// - Added safety checks.

let mockRooms = [
    { room_id: 1, name: 'Conference Room A', capacity: 10, location: 'Floor 1', is_deleted: false, created_at: '2025-10-16T00:00:00' },
    { room_id: 2, name: 'Meeting Room B', capacity: 6, location: 'Floor 2', is_deleted: false, created_at: '2025-10-16T00:00:00' },
];

let mockFacilities = [
    { facility_id: 1, name: 'Projector' },
    { facility_id: 2, name: 'Whiteboard' },
];

let mockRoomFacilities = [
    { room_id: 1, facility_id: 1 },
    { room_id: 1, facility_id: 2 },
    { room_id: 2, facility_id: 1 },
];

let mockBookings = [
    { booking_id: 1, room_id: 1, user_id: 1, title: 'Team Meeting', start_time: '2025-10-17T09:00:00', end_time: '2025-10-17T10:00:00', status: 'PENDING', created_at: '2025-10-16T00:00:00' },
];

let mockAuditLogs = [];

let mockUsers = [
    { user_id: 1, username: 'user1', password: 'password', role_name: 'USER', full_name: 'John Doe', email: 'user1@example.com' },
    { user_id: 2, username: 'admin1', password: 'password', role_name: 'ADMIN', full_name: 'Admin User', email: 'admin1@example.com' },
];

let nextId = { rooms: 3, bookings: 2, audit: 1 };

export const mockLogin = async (username, password) => {
    return new Promise((resolve, reject) => {
        const user = mockUsers.find(u => u.username === username && u.password === password);
        if (user) {
            resolve({ statusCode: '00', result: { user }, message: 'Login successfully!', token: 'mock-jwt' });
        } else {
            reject(new Error('Invalid credentials'));
        }
    });
};

export const mockGetAvailableRooms = async (params) => {
    return new Promise((resolve) => {
        const { start_time, end_time, min_capacity, facilities } = params || {};
        if (start_time && end_time && end_time <= start_time) throw new Error('Invalid times');
        let activeRooms = mockRooms.filter(r => !r.is_deleted && (!min_capacity || r.capacity >= min_capacity));
        if (start_time && end_time && facilities) {
            activeRooms = activeRooms.filter(r => {
                const roomFacs = mockRoomFacilities.filter(rf => rf.room_id === r.room_id).map(rf => rf.facility_id);
                if (facilities.length && !facilities.every(f => roomFacs.includes(f))) return false;
                const overlapping = mockBookings.some(b => b.room_id === r.room_id && ['PENDING', 'APPROVED'].includes(b.status) &&
                    !(new Date(end_time) <= new Date(b.start_time) || new Date(start_time) >= new Date(b.end_time)));
                return !overlapping;
            });
        }
        const result = activeRooms.map(r => ({
            ...r,
            facilities: mockRoomFacilities
                .filter(rf => rf.room_id === r.room_id)
                .map(rf => mockFacilities.find(f => f.facility_id === rf.facility_id))
                .filter(Boolean)
        }));
        resolve({ statusCode: '00', result, message: 'Success' });
    });
};

export const mockCreateBooking = async (data) => {
    return new Promise((resolve, reject) => {
        const { room_id, title, start_time, end_time } = data;
        const user_id = parseInt(localStorage.getItem('userId')) || 1;
        if (!room_id || end_time <= start_time || !title) return reject(new Error('Invalid input'));
        const room = mockRooms.find(r => r.room_id === room_id && !r.is_deleted);
        if (!room) return reject(new Error('Room not available'));
        const overlapping = mockBookings.some(b => b.room_id === room_id && ['PENDING', 'APPROVED'].includes(b.status) &&
            !(new Date(end_time) <= new Date(b.start_time) || new Date(start_time) >= new Date(b.end_time)));
        if (overlapping) return reject(new Error('Room not available'));
        const newBooking = { booking_id: nextId.bookings++, room_id, user_id, title, start_time, end_time, status: 'PENDING', created_at: new Date().toISOString() };
        mockBookings.push(newBooking);
        resolve({ statusCode: '00', result: newBooking, message: 'Booking created' });
    });
};

export const mockGetMyBookings = async (params) => {
    return new Promise((resolve) => {
        const user_id = parseInt(localStorage.getItem('userId')) || 1;
        const { start_time, end_time, status } = params || {};
        let filtered = mockBookings.filter(b => b.user_id === user_id);
        if (start_time) filtered = filtered.filter(b => new Date(b.start_time) >= new Date(start_time));
        if (end_time) filtered = filtered.filter(b => new Date(b.end_time) <= new Date(end_time));
        if (status) filtered = filtered.filter(b => b.status === status);
        const result = filtered.map(b => ({ ...b, room: mockRooms.find(r => r.room_id === b.room_id) }));
        resolve({ statusCode: '00', result, message: 'Success' });
    });
};

export const mockCancelMyBooking = async (booking_id) => {
    return new Promise((resolve, reject) => {
        const user_id = parseInt(localStorage.getItem('userId')) || 1;
        const booking = mockBookings.find(b => b.booking_id === booking_id && b.user_id === user_id && b.status === 'PENDING');
        if (!booking) return reject(new Error('Cannot cancel'));
        booking.status = 'CANCELLED';
        resolve({ statusCode: '00', message: 'Cancelled' });
    });
};

export const mockGetSchedule = async (params) => {
    return new Promise((resolve, reject) => {
        const { room_id, start_time, end_time } = params || {};
        if (!room_id || !start_time || !end_time) return reject(new Error('Invalid params'));
        const room = mockRooms.find(r => r.room_id === room_id && !r.is_deleted);
        if (!room) return reject(new Error('Room not found'));
        const bookings = mockBookings.filter(b => b.room_id === room_id && ['PENDING', 'APPROVED'].includes(b.status) &&
            new Date(b.start_time) >= new Date(start_time) && new Date(b.end_time) <= new Date(end_time));
        resolve({ statusCode: '00', result: bookings, message: 'Success' });
    });
};

export const mockCreateRoom = async (data) => {
    return new Promise((resolve, reject) => {
        const { name, capacity, location, facilities } = data;
        if (!name || capacity <= 0) return reject(new Error('Invalid input'));
        const newRoom = { room_id: nextId.rooms++, name, capacity, location, is_deleted: false, created_at: new Date().toISOString() };
        mockRooms.push(newRoom);
        if (facilities && Array.isArray(facilities)) {
            facilities.forEach(f => mockRoomFacilities.push({ room_id: newRoom.room_id, facility_id: f }));
        }
        const resultFacilities = facilities ? facilities.map(f => mockFacilities.find(fac => fac.facility_id === f)).filter(Boolean) : [];
        resolve({ statusCode: '00', result: { ...newRoom, facilities: resultFacilities }, message: 'Room created' });
    });
};

export const mockUpdateRoom = async (room_id, data) => {
    return new Promise((resolve, reject) => {
        const room = mockRooms.find(r => r.room_id === room_id);
        if (!room) return reject(new Error('Room not found'));
        Object.assign(room, { name: data.name, capacity: data.capacity, location: data.location });
        if (data.facilities !== undefined) {
            mockRoomFacilities = mockRoomFacilities.filter(rf => rf.room_id !== room_id);
            if (Array.isArray(data.facilities)) {
                data.facilities.forEach(f => mockRoomFacilities.push({ room_id, facility_id: f }));
            }
        }
        const resultFacilities = data.facilities ? data.facilities.map(f => mockFacilities.find(fac => fac.facility_id === f)).filter(Boolean) : 
            mockRoomFacilities.filter(rf => rf.room_id === room_id).map(rf => mockFacilities.find(f => f.facility_id === rf.facility_id)).filter(Boolean);
        resolve({ 
            statusCode: '00', 
            result: { ...room, facilities: resultFacilities }, 
            message: 'Room updated' 
        });
    });
};

export const mockDeleteRoom = async (room_id) => {
    return new Promise((resolve, reject) => {
        const room = mockRooms.find(r => r.room_id === room_id && !r.is_deleted);
        if (!room) return reject(new Error('Cannot delete'));
        const futureBookings = mockBookings.some(b => b.room_id === room_id && ['PENDING', 'APPROVED'].includes(b.status) && new Date(b.start_time) > new Date());
        if (futureBookings) return reject(new Error('Has future bookings'));
        room.is_deleted = true;
        resolve({ statusCode: '00', message: 'Deleted' });
    });
};

export const mockGetAllRooms = async (params) => {
    return new Promise((resolve) => {
        let filtered = mockRooms.filter(r => !r.is_deleted);
        // Add filters if needed later
        const result = filtered.map(r => ({
            ...r,
            facilities: mockRoomFacilities
                .filter(rf => rf.room_id === r.room_id)
                .map(rf => mockFacilities.find(f => f.facility_id === rf.facility_id))
                .filter(Boolean)
        }));
        resolve({ statusCode: '00', result, message: 'Success' });
    });
};

export const mockGetRoomById = async (room_id) => {
    return new Promise((resolve, reject) => {
        const room = mockRooms.find(r => r.room_id === room_id);
        if (!room) return reject(new Error('Not found'));
        const facIds = mockRoomFacilities.filter(rf => rf.room_id === room_id).map(rf => rf.facility_id);
        resolve({ statusCode: '00', result: { ...room, facilities: facIds }, message: 'Success' });
    });
};

export const mockGetAllBookings = async (params) => {
    return new Promise((resolve) => {
        let filtered = [...mockBookings];
        const { room_id, start_time, end_time, user_id } = params || {};
        if (room_id) filtered = filtered.filter(b => b.room_id === room_id);
        if (start_time) filtered = filtered.filter(b => new Date(b.start_time) >= new Date(start_time));
        if (end_time) filtered = filtered.filter(b => new Date(b.end_time) <= new Date(end_time));
        if (user_id) filtered = filtered.filter(b => b.user_id === user_id);
        const result = filtered.map(b => ({
            ...b,
            room: mockRooms.find(r => r.room_id === b.room_id),
            user: mockUsers.find(u => u.user_id === b.user_id)
        }));
        resolve({ statusCode: '00', result, message: 'Success' });
    });
};

export const mockApproveBooking = async (booking_id) => {
    return new Promise((resolve, reject) => {
        const admin_id = parseInt(localStorage.getItem('userId')) || 2;
        const booking = mockBookings.find(b => b.booking_id === booking_id && b.status === 'PENDING');
        if (!booking) return reject(new Error('Cannot approve'));
        booking.status = 'APPROVED';
        booking.action_by = admin_id;
        booking.action_at = new Date().toISOString();
        mockAuditLogs.push({ log_id: nextId.audit++, booking_id, action: 'APPROVED', action_by: admin_id, action_at: new Date().toISOString() });
        resolve({ statusCode: '00', message: 'Approved' });
    });
};

export const mockRejectBooking = async (booking_id, reason) => {
    return new Promise((resolve, reject) => {
        const admin_id = parseInt(localStorage.getItem('userId')) || 2;
        const booking = mockBookings.find(b => b.booking_id === booking_id && b.status === 'PENDING');
        if (!booking) return reject(new Error('Cannot reject'));
        booking.status = 'REJECTED';
        booking.action_by = admin_id;
        booking.action_at = new Date().toISOString();
        booking.action_reason = reason;
        mockAuditLogs.push({ log_id: nextId.audit++, booking_id, action: 'REJECTED', action_by: admin_id, action_at: new Date().toISOString(), action_reason: reason });
        resolve({ statusCode: '00', message: 'Rejected' });
    });
};

export const mockCancelBooking = async (booking_id, reason) => {
    return new Promise((resolve, reject) => {
        const admin_id = parseInt(localStorage.getItem('userId')) || 2;
        const booking = mockBookings.find(b => b.booking_id === booking_id && b.status === 'APPROVED');
        if (!booking) return reject(new Error('Cannot cancel'));
        booking.status = 'CANCELLED';
        booking.action_by = admin_id;
        booking.action_at = new Date().toISOString();
        booking.action_reason = reason;
        mockAuditLogs.push({ log_id: nextId.audit++, booking_id, action: 'CANCELLED', action_by: admin_id, action_at: new Date().toISOString(), action_reason: reason });
        resolve({ statusCode: '00', message: 'Cancelled' });
    });
};

export { mockFacilities, mockRooms };