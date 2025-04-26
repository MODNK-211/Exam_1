const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../db');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to authenticate admins
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret_key');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all applications
router.get('/applications', authenticateAdmin, async (req, res) => {
  try {
    const applications = await pool.query(
      `SELECT applications.id, users.name AS student_name, rooms.name AS room_name, applications.status
       FROM applications
       LEFT JOIN users ON applications.student_id = users.id
       LEFT JOIN rooms ON applications.room_id = rooms.id`
    );

    res.json(applications.rows);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update application status
router.post(
  '/application/status',
  [
    body('applicationId').notEmpty().withMessage('Application ID is required'),
    body('status').isIn(['approved', 'rejected']).withMessage('Invalid status'),
  ],
  authenticateAdmin,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { applicationId, status } = req.body;

    try {
      // Update the application status
      const result = await pool.query(
        'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *',
        [status, applicationId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Application not found' });
      }

      res.json({ message: 'Application status updated successfully', application: result.rows[0] });
    } catch (error) {
      console.error('Error updating application status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// Assign a room to a student
router.post(
  '/assign-room',
  [
    body('applicationId').notEmpty().withMessage('Application ID is required'),
    body('roomId').notEmpty().withMessage('Room ID is required'),
  ],
  authenticateAdmin,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { applicationId, roomId } = req.body;

    try {
      // Check if the room is available
      const room = await pool.query('SELECT * FROM rooms WHERE id = $1 AND available = TRUE', [roomId]);
      if (room.rows.length === 0) {
        return res.status(400).json({ message: 'Room is not available or does not exist' });
      }

      // Assign the room to the student
      const application = await pool.query(
        'UPDATE applications SET room_id = $1, status = $2 WHERE id = $3 RETURNING *',
        [roomId, 'approved', applicationId]
      );

      if (application.rows.length === 0) {
        return res.status(404).json({ message: 'Application not found' });
      }

      // Mark the room as unavailable
      await pool.query('UPDATE rooms SET available = FALSE WHERE id = $1', [roomId]);

      res.json({ message: 'Room assigned successfully', application: application.rows[0] });
    } catch (error) {
      console.error('Error assigning room:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

module.exports = router;