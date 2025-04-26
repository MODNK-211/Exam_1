document.addEventListener("DOMContentLoaded", async () => {
    const applicationsTable = document.getElementById("applicationsTable");

    async function fetchApplications() {
        try {
            const response = await fetch("http://localhost:3000/api/admin/applications", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const applications = await response.json();

            applicationsTable.innerHTML = ""; // Clear existing rows

            applications.forEach((application) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${application.studentId}</td>
                    <td>${application.studentName}</td>
                    <td>${application.roomPreference}</td>
                    <td>${application.status}</td>
                    <td>
                        ${application.status === "pending" ? `
                            <button class="approve-btn" data-id="${application.studentId}">Approve</button>
                            <button class="reject-btn" data-id="${application.studentId}">Reject</button>
                        ` : "No actions available"}
                    </td>
                `;
                applicationsTable.appendChild(row);
            });

            document.querySelectorAll(".approve-btn").forEach((button) => {
                button.addEventListener("click", () => updateApplicationStatus(button.dataset.id, "approved"));
            });

            document.querySelectorAll(".reject-btn").forEach((button) => {
                button.addEventListener("click", () => updateApplicationStatus(button.dataset.id, "rejected"));
            });
        } catch (error) {
            console.error("Error fetching applications:", error);
        }
    }

    async function updateApplicationStatus(studentId, status) {
        try {
            const response = await fetch("http://localhost:3000/api/admin/application/status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ studentId, status }),
            });

            if (response.ok) {
                alert(`Application ${status} successfully.`);
                fetchApplications(); // Refresh the table
            } else {
                alert("Failed to update application status.");
            }
        } catch (error) {
            console.error("Error updating application status:", error);
        }
    }

    fetchApplications();
});