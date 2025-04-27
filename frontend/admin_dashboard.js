document.addEventListener('DOMContentLoaded', () => {
    // Sidebar navigation logic
    const sections = document.querySelectorAll('.admin-section');
    const sidebarLinks = document.querySelectorAll('.dashboard-sidebar a');
    const showSection = (selector) => {
        sections.forEach(sec => sec.style.display = 'none');
        document.querySelector(selector).style.display = '';
    };
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            if (this.id === 'applicationsLink') {
                showSection('.applications-section');
                loadApplications();
            } else if (this.id === 'roomsLink') {
                showSection('.rooms-section');
                loadRooms();
            } else if (this.id === 'assignmentsLink') {
                showSection('.assignments-section');
                loadAssignments();
            } else if (this.id === 'announcementsLink') {
                showSection('.announcements-section');
            }
        });
    });
    // Show applications section by default
    showSection('.applications-section');
    sidebarLinks[0].classList.add('active');

    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'login.html';
    });

    // Admin notification message
    const adminNotif = document.createElement('div');
    adminNotif.id = 'adminNotif';
    adminNotif.style.display = 'none';
    adminNotif.style.marginBottom = '1.2rem';
    adminNotif.style.padding = '0.7rem 1.2rem';
    adminNotif.style.borderRadius = '6px';
    adminNotif.style.fontWeight = '500';
    adminNotif.style.fontSize = '1.05rem';
    document.querySelector('.dashboard-main').prepend(adminNotif);

    function showAdminNotif(msg, type = 'success') {
        adminNotif.textContent = msg;
        adminNotif.style.display = 'block';
        adminNotif.style.background = type === 'success' ? '#e8f5e9' : '#ffebee';
        adminNotif.style.color = type === 'success' ? '#388e3c' : '#b71c1c';
        setTimeout(() => { adminNotif.style.display = 'none'; }, 3500);
    }

    // Fetch and display applications
    async function loadApplications() {
        const tableDiv = document.getElementById('applicationsTable');
        tableDiv.innerHTML = '<div>Loading applications...</div>';
        try {
            const response = await fetch('http://localhost:3000/api/admin/applications', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const applications = await response.json();
            if (!Array.isArray(applications) || applications.length === 0) {
                tableDiv.innerHTML = '<div>No applications found.</div>';
                return;
            }
            tableDiv.innerHTML = `
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Room Preference</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${applications.map(app => `
                            <tr>
                                <td>${app.name}</td>
                                <td>${app.email}</td>
                                <td>${app.room_name || app.roomPreference}</td>
                                <td>${app.status}</td>
                                <td class="admin-table-action">
                                    ${app.status === 'pending' ? `
                                        <button class="admin-btn accept" data-id="${app.id}" data-action="accept">Accept</button>
                                        <button class="admin-btn reject" data-id="${app.id}" data-action="reject">Reject</button>
                                    ` : ''}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            // Add event listeners for accept/reject
            tableDiv.querySelectorAll('.admin-btn').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const appId = this.getAttribute('data-id');
                    const action = this.getAttribute('data-action');
                    const result = await processApplication(appId, action);
                    if (result && result.success) {
                        showAdminNotif(result.message, 'success');
                    } else {
                        showAdminNotif(result && result.message ? result.message : 'Error processing application.', 'error');
                    }
                    loadApplications();
                });
            });
        } catch (err) {
            tableDiv.innerHTML = '<div>Error loading applications.</div>';
        }
    }

    // Process application (accept/reject)
    async function processApplication(appId, action) {
        try {
            const res = await fetch(`http://localhost:3000/api/admin/applications/${appId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ action })
            });
            const data = await res.json();
            return { success: res.ok, message: data.message };
        } catch (err) {
            return { success: false, message: 'Network error.' };
        }
    }

    // Fetch and display all rooms
    async function loadRooms() {
        const tableDiv = document.getElementById('roomsTable');
        tableDiv.innerHTML = '<div>Loading rooms...</div>';
        try {
            const response = await fetch('http://localhost:3000/api/admin/rooms', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const rooms = await response.json();
            if (!Array.isArray(rooms) || rooms.length === 0) {
                tableDiv.innerHTML = '<div>No rooms found.</div>';
                return;
            }
            tableDiv.innerHTML = `
                <div class="room-grid">
                    ${rooms.map(room => `
                        <div class="room-card">
                            <img src="images/${getRoomImage(room.name)}" alt="${room.name}" class="room-card-img">
                            <div class="room-card-body">
                                <h3 class="room-card-title">${room.name}</h3>
                                <p class="room-card-desc">Capacity: ${room.capacity} students</p>
                                <p class="room-card-status">Status: ${room.available ? 'Available' : 'Occupied'}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } catch (err) {
            tableDiv.innerHTML = '<div>Error loading rooms.</div>';
        }
    }

    // Helper function to get room image
    function getRoomImage(roomName) {
        const imageMap = {
            'Double Occupancy with Fan': 'two_in_a_room_with_fan.jpg',
            'Double Occupancy with AC': 'hostel_pic_four_Ac_twoinaroom.jpg',
            'Single Occupancy with AC': 'hostel_pic_three_single_ac.jpg',
            'Single Occupancy with Bathroom and Kitchen': 'hostel_pic_one.jpg'
        };
        return imageMap[roomName] || 'hostel_pic_one.jpg';
    }

    // Populate assign-room form
    async function populateAssignRoomForm() {
        const studentSelect = document.getElementById('assignStudent');
        const roomSelect = document.getElementById('assignRoom');
        const msg = document.getElementById('assignRoomMsg');
        if (!studentSelect || !roomSelect) return;
        
        studentSelect.innerHTML = '<option value="">Loading...</option>';
        roomSelect.innerHTML = '<option value="">Loading...</option>';
        msg.textContent = '';
        
        try {
            // Fetch students without assigned rooms
            const studentsRes = await fetch('http://localhost:3000/api/admin/applications', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const students = await studentsRes.json();
            
            // Filter for approved students who don't have a room assigned
            const unassigned = students.filter(s => s.status === 'approved' && !s.room_id);
            
            studentSelect.innerHTML = unassigned.length ?
                unassigned.map(s => `<option value="${s.id}">${s.name} (${s.email})</option>`).join('') :
                '<option value="">No approved students without rooms</option>';
            
            // Fetch available rooms
            const roomsRes = await fetch('http://localhost:3000/api/admin/rooms', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const rooms = await roomsRes.json();
            const available = rooms.filter(r => r.available);
            
            roomSelect.innerHTML = available.length ?
                available.map(r => `<option value="${r.id}">${r.name} (Capacity: ${r.capacity})</option>`).join('') :
                '<option value="">No available rooms</option>';
                
            if (!unassigned.length || !available.length) {
                msg.textContent = !unassigned.length ? 'No approved students need room assignment' : 'No rooms available for assignment';
            }
        } catch (err) {
            console.error('Error populating form:', err);
            studentSelect.innerHTML = '<option value="">Error loading students</option>';
            roomSelect.innerHTML = '<option value="">Error loading rooms</option>';
            msg.textContent = 'Error loading data. Please try again.';
        }
    }

    // Handle assign-room form submission
    const assignRoomForm = document.getElementById('assignRoomForm');
    if (assignRoomForm) {
        assignRoomForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const studentId = document.getElementById('assignStudent').value;
            const roomId = document.getElementById('assignRoom').value;
            const msg = document.getElementById('assignRoomMsg');
            
            if (!studentId || !roomId) {
                msg.textContent = 'Please select both a student and a room';
                return;
            }
            
            msg.textContent = 'Assigning room...';
            try {
                const res = await fetch('http://localhost:3000/api/admin/assign-room', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ applicationId: studentId, roomId })
                });
                
                const data = await res.json();
                
                if (res.ok) {
                    msg.textContent = 'Room assigned successfully!';
                    showAdminNotif('Room assigned successfully!', 'success');
                    // Refresh both assignments and form
                    await Promise.all([loadAssignments(), populateAssignRoomForm()]);
                } else {
                    msg.textContent = data.message || 'Error assigning room';
                    showAdminNotif(data.message || 'Error assigning room', 'error');
                }
            } catch (err) {
                console.error('Error assigning room:', err);
                msg.textContent = 'Network error. Please try again.';
                showAdminNotif('Network error. Please try again.', 'error');
            }
        });
    }

    // When assignments section is shown, populate form
    const originalLoadAssignments = loadAssignments;
    loadAssignments = async function() {
        await populateAssignRoomForm();
        await originalLoadAssignments();
    };

    // Fetch and display all assignments
    async function loadAssignments() {
        const tableDiv = document.getElementById('assignmentsTable');
        tableDiv.innerHTML = '<div>Loading assignments...</div>';
        try {
            const response = await fetch('http://localhost:3000/api/admin/assignments', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const assignments = await response.json();
            if (!Array.isArray(assignments) || assignments.length === 0) {
                tableDiv.innerHTML = '<div>No assignments found.</div>';
                return;
            }
            tableDiv.innerHTML = `
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Email</th>
                            <th>Assigned Room</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${assignments.map(assignment => `
                            <tr>
                                <td>${assignment.name}</td>
                                <td>${assignment.email}</td>
                                <td>${assignment.room_name || 'Not assigned'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } catch (err) {
            tableDiv.innerHTML = '<div>Error loading assignments.</div>';
        }
    }

    // Initial load
    loadApplications();
});
