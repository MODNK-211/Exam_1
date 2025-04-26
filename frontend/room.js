document.addEventListener("DOMContentLoaded", async () => {
    const roomList = document.getElementById("roomList");

    try {
        const response = await fetch("http://localhost:3000/api/admin/rooms", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        const rooms = await response.json();

        rooms.forEach((room) => {
            const roomDiv = document.createElement("div");
            roomDiv.innerHTML = `
                <h2>${room.name}</h2>
                <p>Capacity: ${room.capacity}</p>
                <p>Available: ${room.available ? "Yes" : "No"}</p>
            `;
            roomList.appendChild(roomDiv);
        });
    } catch (error) {
        console.error("Error fetching rooms:", error);
    }
});