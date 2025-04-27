# Campus Hostel Management System

A comprehensive web-based platform for managing student hostel accommodations at Academic City University. This system streamlines the process of room applications, assignments, and management for both students and administrators.

## Features

### For Students
- User registration and authentication
- View available rooms with images and details
- Apply for preferred room types
- Track application status
- View assigned room details
- Receive announcements and notifications

### For Administrators
- Manage student applications
- Assign rooms to approved students
- View and manage room inventory
- Track room occupancy
- Post announcements
- Monitor system statistics

## Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)
- Responsive Design
- Modern UI/UX

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- RESTful API

## Project Structure

```
project/
├── frontend/
│   ├── css/
│   │   ├── admin_dashboard.css
│   │   ├── student_dashboard.css
│   │   └── ...
│   ├── images/
│   │   ├── room_images/
│   │   └── ...
│   ├── js/
│   │   ├── admin_dashboard.js
│   │   ├── student_dashboard.js
│   │   └── ...
│   ├── admin_dashboard.html
│   ├── student_dashboard.html
│   ├── login.html
│   └── register.html
├── backend/
│   ├── routes/
│   │   ├── admin.js
│   │   ├── student.js
│   │   └── auth.js
│   ├── db/
│   │   └── connection.js
│   ├── server.js
│   └── package.json
└── README.md
```

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Set up the database:
- Create a PostgreSQL database
- Update the database connection details in `backend/db/connection.js`

4. Start the backend server:
```bash
npm start
```

5. Open the frontend:
- Open the `frontend` directory in your browser
- Or use a local server to serve the frontend files

## Usage

### Student Access
1. Register as a new student
2. Log in to the student dashboard
3. Browse available rooms
4. Submit room application
5. Track application status
6. View assigned room details

### Admin Access
1. Log in to the admin dashboard
2. Review pending applications
3. Approve/reject applications
4. Assign rooms to approved students
5. Manage room inventory
6. Post announcements

## Room Types

1. Double Occupancy with Fan
2. Double Occupancy with AC
3. Single Occupancy with AC
4. Single Occupancy with Bathroom and Kitchen

## Security Features

- JWT-based authentication
- Role-based access control
- Secure password hashing
- Input validation
- CORS protection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

Screenshots 
C:\Users\Dell Users\Desktop\Exam_1\frontend\images\screenshots
C:\Users\Dell Users\Desktop\Exam_1\frontend\images\screenshots\WhatsApp Image 2025-04-27 at 19.21.24_87903df3.jpg
C:\Users\Dell Users\Desktop\Exam_1\frontend\images\screenshots\WhatsApp Image 2025-04-27 at 19.21.24_ea628fa7.jpg
C:\Users\Dell Users\Desktop\Exam_1\frontend\images\screenshots\WhatsApp Image 2025-04-27 at 19.22.12_e9cb4c15.jpg
C:\Users\Dell Users\Desktop\Exam_1\frontend\images\screenshots\WhatsApp Image 2025-04-27 at 19.22.51_db1e6686.jpg
C:\Users\Dell Users\Desktop\Exam_1\frontend\images\screenshots\WhatsApp Image 2025-04-27 at 19.24.10_198688b5.jpg
C:\Users\Dell Users\Desktop\Exam_1\frontend\images\screenshots\WhatsApp Image 2025-04-27 at 19.24.10_198688b5.jpg
C:\Users\Dell Users\Desktop\Exam_1\frontend\images\screenshots\WhatsApp Image 2025-04-27 at 19.29.39_484a30c7.jpg
C:\Users\Dell Users\Desktop\Exam_1\frontend\images\screenshots\WhatsApp Image 2025-04-27 at 19.34.46_1260d66a.jpg
C:\Users\Dell Users\Desktop\Exam_1\frontend\images\screenshots\WhatsApp Image 2025-04-27 at 19.35.55_0ad13aa0.jpg
C:\Users\Dell Users\Desktop\Exam_1\frontend\images\screenshots\WhatsApp Image 2025-04-27 at 19.38.16_54943460.jpg



