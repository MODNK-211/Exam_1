document.addEventListener("DOMContentLoaded", async () => {
    const assignedRoomDiv = document.getElementById("assignedRoom");

    async function fetchAssignedRoom() {
        try {
            const studentId = localStorage.getItem('userId'); // Assume the student's ID is stored in localStorage
            console.log('Student ID:', studentId); // Debugging line to check the student ID
            console.log('Token:', localStorage.getItem('token')); // Debugging line to check the token
            console.log('User Type:', localStorage.getItem('userType')); // Debugging line to check the user type
            if (!studentId) {
                assignedRoomDiv.innerHTML = '<p>Error: No student ID found. Please log in again.</p>';
                return;
            }

            const response = await fetch(`http://localhost:3000/api/student/dashboard/${studentId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`, // Include token if required
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    assignedRoomDiv.innerHTML = '<p>No room assignment found.</p>';
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return;
            }

            const { applicationStatus, assignedRoom } = await response.json();

            // Display the assigned room details
            assignedRoomDiv.innerHTML = assignedRoom
                ? `<p><strong>Assigned Room:</strong> ${assignedRoom}</p>`
                : `<p><strong>Application Status:</strong> ${applicationStatus}</p>`;
        } catch (error) {
            console.error('Error fetching assigned room:', error);
            assignedRoomDiv.innerHTML = '<p>Error fetching assigned room details. Please try again later.</p>';
        }
    }

    fetchAssignedRoom();
});