document.addEventListener("DOMContentLoaded", async () => {
    const assignedRoomDiv = document.getElementById("assignedRoom");
    const applicationStatusDiv = document.getElementById("applicationStatus");

    async function fetchAssignedRoom() {
        try {
            const studentId = localStorage.getItem("studentId"); // Assuming the student ID is stored in localStorage
            const token = localStorage.getItem("token");

            if (!studentId || !token) {
                alert("You must be logged in to view your dashboard.");
                window.location.href = "login.html"; // Redirect to login if not logged in
                return;
            }

            const response = await fetch(`http://localhost:3000/api/student/dashboard/${studentId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch student data");
            }

            const data = await response.json();
            const { assignedRoom, applicationStatus } = data;

            // Display assigned room or application status
            if (assignedRoom) {
                assignedRoomDiv.innerHTML = `<p><strong>Assigned Room:</strong> ${assignedRoom.name}</p>`;
            } else {
                assignedRoomDiv.innerHTML = `<p>No room assigned yet.</p>`;
            }

            applicationStatusDiv.innerHTML = `<p><strong>Application Status:</strong> ${applicationStatus}</p>`;

        } catch (error) {
            console.error("Error fetching assigned room:", error);
            assignedRoomDiv.innerHTML = "<p>Error fetching your assigned room. Please try again later.</p>";
        }
    }

    fetchAssignedRoom();

    // Section switching logic
    const sections = document.querySelectorAll('.dashboard-section');
    const showSection = (selector) => {
        sections.forEach(sec => sec.style.display = 'none');
        document.querySelector(selector).style.display = '';
    };

    // Fetch and display available rooms
    async function loadRoomListings() {
        const roomListingsDiv = document.getElementById('roomListings');
        roomListingsDiv.innerHTML = '<div>Loading rooms...</div>';
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = 'login.html';
                return;
            }

            const response = await fetch('http://localhost:3000/api/student/rooms', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch rooms');
            }

            const rooms = await response.json();
            
            // Map room types to their corresponding images
            const roomImageMap = {
                'Double Occupancy with Fan': 'two_in_a_room_with_fan.jpg',
                'Double Occupancy with AC': 'hostel_pic_four_Ac_twoinaroom.jpg',
                'Single Occupancy with AC': 'hostel_pic_three_single_ac.jpg',
                'Single Occupancy with Bathroom and Kitchen': 'hostel_pic_one.jpg'
            };

            if (!rooms || rooms.length === 0) {
                roomListingsDiv.innerHTML = '<div>No rooms available at the moment.</div>';
                return;
            }

            roomListingsDiv.innerHTML = rooms.map(room => `
                <div class="room-card">
                    <img src="images/${roomImageMap[room.name] || 'hostel_pic_one.jpg'}" alt="${room.name}" class="room-card-img" />
                    <div class="room-card-body">
                        <div class="room-card-title">${room.name}</div>
                        <div class="room-card-desc">${room.description || 'Comfortable living space with all necessary amenities'}</div>
                        <div class="room-card-occupancy">Capacity: ${room.capacity} students</div>
                    </div>
                </div>
            `).join('');
        } catch (err) {
            console.error('Error loading rooms:', err);
            roomListingsDiv.innerHTML = '<div>Error loading rooms. Please try again later.</div>';
        }
    }

    // Fetch and display application status and assigned room
    async function loadApplicationStatus() {
        const token = localStorage.getItem('token');
        const statusDiv = document.getElementById('roomStatus');
        const announcementsList = document.getElementById('announcementsList');
        if (!token || !statusDiv) return;
        statusDiv.textContent = 'Loading...';
        try {
            const response = await fetch('http://localhost:3000/api/student/dashboard', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                let notif = '';
                if (data.applicationStatus === 'approved') {
                    notif = '<li style="color: #43a047; font-weight: 600;">Your application was approved! Please check your assigned room.</li>';
                } else if (data.applicationStatus === 'rejected') {
                    notif = '<li style="color: #e53935; font-weight: 600;">Your application was rejected. Please contact admin.</li>';
                }
                if (announcementsList && notif) {
                    announcementsList.innerHTML = notif;
                }
                statusDiv.innerHTML = `<strong>Application Status:</strong> ${data.applicationStatus || 'N/A'}<br>` +
                    (data.assignedRoom ? `<strong>Assigned Room:</strong> ${data.assignedRoom}` : 'No room assigned yet.');
            } else {
                statusDiv.textContent = data.message || 'No application found.';
                if (announcementsList) announcementsList.innerHTML = '';
            }
        } catch (err) {
            statusDiv.textContent = 'Error loading status.';
            if (announcementsList) announcementsList.innerHTML = '';
        }
    }

    // Sidebar navigation: highlight active link and show/hide sections
    const sidebarLinks = document.querySelectorAll('.dashboard-sidebar a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            // Show the corresponding section
            if (this.id === 'roomListingsLink') {
                showSection('.room-listings-section');
                loadRoomListings();
            } else if (this.id === 'applyRoomLink') {
                showSection('.apply-room-section');
            } else if (this.id === 'myRoomLink') {
                showSection('.room-status-section');
                loadApplicationStatus();
            } else if (this.id === 'applicationStatusLink') {
                showSection('.room-status-section');
                loadApplicationStatus();
            } else if (this.id === 'announcementsLink') {
                showSection('.announcements-section');
            } else {
                showSection('.welcome-section');
            }
        });
    });

    // Show welcome section by default
    showSection('.welcome-section');

    // Auto-fill name and email in Apply for Room form
    const studentName = localStorage.getItem('studentName') || 'Student';
    const studentEmail = localStorage.getItem('studentEmail') || '';
    document.getElementById('studentName').textContent = studentName;
    document.getElementById('welcomeName').textContent = studentName.split(' ')[0];
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    if (nameInput) nameInput.value = studentName;
    if (emailInput) emailInput.value = studentEmail;

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'login.html';
    });

    // Populate Apply for Room dropdown
    async function populateRoomDropdown() {
        const select = document.getElementById('roomPreference');
        if (!select) return;
        select.innerHTML = '<option value="">Select Room</option>';
        try {
            const response = await fetch('http://localhost:3000/api/student/rooms');
            const rooms = await response.json();
            rooms.forEach(room => {
                const option = document.createElement('option');
                option.value = room.id;
                option.textContent = `${room.name} (Occupancy: ${room.occupancy})`;
                select.appendChild(option);
            });
        } catch (err) {
            select.innerHTML = '<option value="">Error loading rooms</option>';
        }
    }

    // Handle Apply for Room form submission
    const roomApplicationForm = document.getElementById('roomApplicationForm');
    if (roomApplicationForm) {
        roomApplicationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const roomPreference = document.getElementById('roomPreference').value;
            const token = localStorage.getItem('token');
            const applicationMessage = document.getElementById('applicationMessage');

            if (!roomPreference) {
                applicationMessage.textContent = 'Please select a room preference';
                applicationMessage.style.color = '#f44336';
                return;
            }

            applicationMessage.textContent = 'Submitting...';
            try {
                const response = await fetch('http://localhost:3000/api/student/apply', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ roomPreference })
                });
                const data = await response.json();
                if (response.ok) {
                    applicationMessage.textContent = 'Application submitted successfully!';
                    applicationMessage.style.color = '#4CAF50';
                    applicationForm.reset();
                    // Refresh room status
                    fetchRoomStatus();
                } else {
                    applicationMessage.textContent = data.message || 'Error submitting application';
                    applicationMessage.style.color = '#f44336';
                }
            } catch (error) {
                console.error('Error:', error);
                applicationMessage.textContent = 'Error submitting application. Please try again.';
                applicationMessage.style.color = '#f44336';
            }
        });
    }

    // When Apply for Room section is shown, populate dropdown
    const originalShowSection = showSection;
    showSection = function(selector) {
        sections.forEach(sec => sec.style.display = 'none');
        document.querySelector(selector).style.display = '';
        if (selector === '.apply-room-section') {
            populateRoomDropdown();
        }
    };

    // Fetch and display room status
    const fetchRoomStatus = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/student/dashboard', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch room status');
            }

            const data = await response.json();
            
            // Update room status
            const roomStatusElement = document.getElementById('roomStatus');
            if (data.assignedRoom) {
                roomStatusElement.textContent = `Assigned to ${data.assignedRoom}`;
            } else if (data.applicationStatus === 'pending') {
                roomStatusElement.textContent = 'Your application is pending approval';
            } else if (data.applicationStatus === 'not_applied') {
                roomStatusElement.textContent = 'You have not applied for a room yet';
            } else {
                roomStatusElement.textContent = 'No room assigned yet';
            }

        } catch (error) {
            console.error('Error fetching room status:', error);
            document.getElementById('roomStatus').textContent = 'Error loading room status';
        }
    };

    // Initial fetch
    fetchRoomStatus();
});
