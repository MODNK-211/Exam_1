document.addEventListener("DOMContentLoaded", () => {
    const registrationForm = document.getElementById("registrationForm");
    const roomApplicationForm = document.getElementById("roomApplicationForm");

    // Handle student registration
    if (registrationForm) {
        registrationForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            if (!name || !email || !password) {
                alert("Please fill out all fields.");
                return;
            }

            // Simulate registration (replace with backend API call)
            console.log("Student Registered:", { name, email, password });
            alert("Registration successful! Please log in.");
            window.location.href = "login.html";
        });
    }

    // Handle room application
    if (roomApplicationForm) {
        roomApplicationForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const roomType = document.getElementById("roomType").value.trim();
            const duration = document.getElementById("duration").value.trim();
            const email = localStorage.getItem("email");

            if (!roomType || !duration || !email) {
                alert("Please fill out all fields.");
                return;
            }

            try {
                const response = await fetch("http://localhost:5000/api/applications/apply", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({ studentName: "Student", email, roomType, duration }),
                });

                const result = await response.json();
                if (response.ok) {
                    alert("Application submitted successfully!");
                    roomApplicationForm.reset();
                } else {
                    alert(result.error || "Application failed.");
                }
            } catch (error) {
                console.error("Error submitting application:", error);
                alert("An error occurred. Please try again.");
            }
        });
    }
});