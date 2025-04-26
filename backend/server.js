const express = require('express');
const cors = require('cors');
const { connectToDatabase } = require('./db');  // Import DB connection

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const adminRoutes = require('./routes/admin');

// Root route (this will fix "Cannot GET /")
app.get('/', (req, res) => {
  res.send('Welcome to the Campus Hostel Management Platform API');
});

// Use your routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);

// Connect to the database and set up the schema
connectToDatabase().then(() => {
  // Start the server only after the DB connection and schema setup is done
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start the server due to DB issues', err);
  process.exit(1);  // Exit if the DB setup fails
});
