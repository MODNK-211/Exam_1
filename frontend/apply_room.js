document.addEventListener("DOMContentLoaded", async () => {
    const roomPreferenceSelect = document.getElementById("roomPreference");

    // Fetch available rooms and populate the room preference dropdown
    try {
        const response = await fetch("http://localhost:3000/api/rooms"); // Assume an API endpoint to fetch available rooms
        const rooms = await response.json();

        rooms.forEach(room => {
            const option = document.createElement("option");
            option.value = room.id;
            option.textContent = room.name;
            roomPreferenceSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching rooms:", error);
    }

    // Handle form submission
    document.getElementById("roomApplicationForm").addEventListener("submit", async function (e) {
        e.preventDefault();

        const data = {
            roomPreference: document.getElementById("roomPreference").value,
            studentDetails: {
                name: document.getElementById("name").value,
                email: document.getElementById("email").value
            }
        };

        try {
            const response = await fetch("http://localhost:3000/api/student/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message || "Application submitted successfully!");
                // Optionally, redirect or reset the form
                window.location.href = "student_dashboard.html"; // Assuming there's a dashboard page
            } else {
                alert(result.message || "Failed to submit application. Please try again.");
            }
        } catch (error) {
            console.error("Error submitting application:", error);
            alert("An error occurred. Please try again later.");
        }
    });
});
