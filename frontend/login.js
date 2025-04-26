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
            localStorage.setItem("token", token);
            console.log("Token:", token); // Log the token for debugging
            localStorage.setItem("userType", userType);
            localStorage.setItem("userId", userId); // Store userId in local storage
            console.log("User ID:", userId); // Log the userId for debugging

            if (userType === "admin") {
                window.location.href = "/frontend/admin_dashboard.html";
            } else {
                window.location.href = "/frontend/student_dashboard.html";
            }
        } else {
            alert("Invalid credentials. Please try again.");
        }
    } catch (error) {
        console.error("Error during login:", error);
    }
});