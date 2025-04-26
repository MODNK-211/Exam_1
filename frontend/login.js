document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const { token, userType, userId } = await response.json();
            localStorage.setItem("token", token); // Store token in localStorage
            localStorage.setItem("userType", userType); // Store user type
            localStorage.setItem("userId", userId); // Store user ID

            // Redirect user based on their role
            if (userType === "admin") {
                window.location.href = "/frontend/admin_dashboard.html";
            } else {
                window.location.href = "/frontend/student_dashboard.html";
            }
        } else {
            // Improved error handling with user-friendly message
            const errorResponse = await response.json();
            alert(errorResponse.message || "Invalid credentials. Please try again.");
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert("An error occurred. Please try again later.");
    }
});
