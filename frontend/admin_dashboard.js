document.addEventListener("DOMContentLoaded", async () => {
    const applicationListDiv = document.getElementById("applicationList");

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("You must be logged in as an admin to view this page.");
            return;
        }

        // Fetch the applications that need processing
        const response = await fetch("http://localhost:3000/api/admin/applications", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const applications = await response.json();

        if (applications.length === 0) {
            applicationListDiv.innerHTML = "<p>No applications pending for approval.</p>";
            return;
        }

        applications.forEach((application) => {
            const applicationDiv = document.createElement("div");
            applicationDiv.classList.add("application");

            applicationDiv.innerHTML = `
                <h3>${application.studentName} - ${application.roomPreference}</h3>
                <p><strong>Status:</strong> ${application.status}</p>
                <button class="accept-btn" onclick="acceptApplication(${application.id})">Accept</button>
                <button class="reject-btn" onclick="rejectApplication(${application.id})">Reject</button>
                <button class="assign-btn" onclick="assignRoom(${application.id})">Assign Room</button>
            `;
            applicationListDiv.appendChild(applicationDiv);
        });
    } catch (error) {
        console.error("Error fetching applications:", error);
        applicationListDiv.innerHTML = "<p>Error fetching application details. Please try again later.</p>";
    }
});

// Accept application
async function acceptApplication(applicationId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/admin/accept-application/${applicationId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();
        if (response.ok) {
            alert(`Application ${applicationId} accepted successfully.`);
            location.reload(); // Reload the page to update the status
        } else {
            alert(result.message || 'Failed to accept the application.');
        }
    } catch (error) {
        console.error('Error accepting application:', error);
        alert('Error accepting the application. Please try again later.');
    }
}

// Reject application
async function rejectApplication(applicationId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/admin/reject-application/${applicationId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();
        if (response.ok) {
            alert(`Application ${applicationId} rejected successfully.`);
            location.reload(); // Reload the page to update the status
        } else {
            alert(result.message || 'Failed to reject the application.');
        }
    } catch (error) {
        console.error('Error rejecting application:', error);
        alert('Error rejecting the application. Please try again later.');
    }
}

// Assign room to student
async function assignRoom(applicationId) {
    const roomId = prompt('Enter Room ID to assign:');
    if (!roomId) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/admin/assign-room/${applicationId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ roomId }),
        });

        const result = await response.json();
        if (response.ok) {
            alert(`Room assigned successfully to application ${applicationId}.`);
            location.reload(); // Reload the page to update the status
        } else {
            alert(result.message || 'Failed to assign room.');
        }
    } catch (error) {
        console.error('Error assigning room:', error);
        alert('Error assigning room. Please try again later.');
    }
}
