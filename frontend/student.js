document.getElementById("applicationForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const data = {
    studentId: document.getElementById("studentId").value,
    roomPreference: document.getElementById("preferences").value,
    details: {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      gender: document.getElementById("gender").value
    }
  };
  const response = await fetch("http://localhost:3000/api/student/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  const result = await response.json();
  alert(result.message);
});
