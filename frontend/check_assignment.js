document.addEventListener("DOMContentLoaded", async () => {
    const assignmentDiv = document.getElementById("assignment");

    try {
        const studentId = localStorage.getItem("studentId");
        const response = await fetch(`http://localhost:3000/api/student/dashboard/${studentId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });

        if (response.ok) {
            const { assignedRoom, applicationStatus } = await response.json();
            assignmentDiv.innerHTML = assignedRoom
                ? `<p>Your assigned room: ${assignedRoom}</p>`
                : `<p>Application Status: ${applicationStatus}</p>`;
        } else {
            assignmentDiv.innerHTML = "<p>Error fetching assignment details.</p>";
        }
    } catch (error) {
        console.error("Error fetching assignment:", error);
    }
});