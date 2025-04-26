
async function loadApplications() {
  const res = await fetch("http://localhost:5000/api/applications");
  const data = await res.json();
  const list = document.getElementById("applicationList");
  list.innerHTML = "";
  data.forEach(app => {
    const li = document.createElement("li");
    li.textContent = `${app.name} (${app.email}) - ${app.preferences}`;
    const assignBtn = document.createElement("button");
    assignBtn.textContent = "Assign Room";
    assignBtn.onclick = () => assignRoom(app.id);
    li.appendChild(assignBtn);
    list.appendChild(li);
  });
}
async function assignRoom(id) {
  const room = prompt("Enter room to assign:");
  if (!room) return;
  const res = await fetch("http://localhost:5000/api/assign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, room })
  });
  const result = await res.json();
  alert(result.message);
  loadApplications();
}
window.onload = loadApplications;
