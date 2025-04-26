document.getElementById("registrationForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (response.ok) {
        alert("Registration successful! Please log in.");
        window.location.href = "login.html";
    } else {
        alert(data.message || "Registration failed. Please try again.");
    }
});
