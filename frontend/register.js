document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:3000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        if (response.ok) {
            alert("Registration successful! Please log in.");
            window.location.href = "/login.html";
        } else {
            alert("Registration failed. Please try again.");
        }
    } catch (error) {
        console.error("Error during registration:", error);
    }
});