const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../db');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to authenticate students
const authenticateStudent = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret_key');
    if (decoded.role !== 'student') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Apply for a room
router.post(
  '/apply',
  [
    body('roomPreference').notEmpty().withMessage('Room preference is required'),
  ],
  authenticateStudent,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { roomPreference } = req.body;
    const studentId = req.user.id;

    try {
      console.log('Received application request:', { studentId, roomPreference });

      // Check if the student has already applied
      const existingApplication = await pool.query(
        'SELECT * FROM applications WHERE student_id = $1',
        [studentId]
      );
      if (existingApplication.rows.length > 0) {
        return res.status(400).json({ message: 'You have already applied for a room' });
      }

      // First, find a room that matches the preference and is available
      const roomQuery = await pool.query(
        'SELECT id FROM rooms WHERE name = $1 AND available = true',
        [roomPreference]
      );

      console.log('Room query result:', roomQuery.rows);

      if (roomQuery.rows.length === 0) {
        return res.status(400).json({ message: 'No available rooms match your preference' });
      }

      const roomId = roomQuery.rows[0].id;

      // Insert the application into the database
      const applicationResult = await pool.query(
        'INSERT INTO applications (student_id, room_id, status) VALUES ($1, $2, $3) RETURNING *',
        [studentId, roomId, 'pending']
      );

      console.log('Application created:', applicationResult.rows[0]);

      res.status(201).json({ 
        message: 'Application submitted successfully',
        application: applicationResult.rows[0]
      });
    } catch (error) {
      console.error('Detailed error in room application:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }
);

// Get application status
router.get('/dashboard', authenticateStudent, async (req, res) => {
  const studentId = req.user.id;

  try {
    // Fetch the student's application status
    const application = await pool.query(
      'SELECT a.*, r.name as room_name FROM applications a LEFT JOIN rooms r ON a.room_id = r.id WHERE a.student_id = $1',
      [studentId]
    );

    if (application.rows.length === 0) {
      return res.json({
        applicationStatus: 'not_applied',
        assignedRoom: null
      });
    }

    res.json({
      applicationStatus: application.rows[0].status,
      assignedRoom: application.rows[0].room_name,
      submittedDate: application.rows[0].created_at
    });
  } catch (error) {
    console.error('Error fetching application status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/student/rooms - List available rooms
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await pool.query('SELECT * FROM rooms WHERE available = true');
    res.json(rooms.rows);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;