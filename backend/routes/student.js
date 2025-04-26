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
      // Check if the student has already applied
      const existingApplication = await pool.query(
        'SELECT * FROM applications WHERE student_id = $1',
        [studentId]
      );
      if (existingApplication.rows.length > 0) {
        return res.status(400).json({ message: 'You have already applied for a room' });
      }

      // Insert the application into the database
      await pool.query(
        'INSERT INTO applications (student_id, room_id, status) VALUES ($1, $2, $3)',
        [studentId, roomPreference, 'pending']
      );

      res.status(201).json({ message: 'Application submitted successfully' });
    } catch (error) {
      console.error('Error submitting application:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// Get application status
router.get('/dashboard', authenticateStudent, async (req, res) => {
  const studentId = req.user.id;

  try {
    // Fetch the student's application status
    const application = await pool.query(
      'SELECT * FROM applications WHERE student_id = $1',
      [studentId]
    );

    if (application.rows.length === 0) {
      return res.status(404).json({ message: 'No application found' });
    }

    const assignedRoom = application.rows[0].room_id
      ? await pool.query('SELECT * FROM rooms WHERE id = $1', [application.rows[0].room_id])
      : null;

    res.json({
      applicationStatus: application.rows[0].status,
      assignedRoom: assignedRoom ? assignedRoom.rows[0].name : null,
    });
  } catch (error) {
    console.error('Error fetching application status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;