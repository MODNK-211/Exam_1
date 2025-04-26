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
});
