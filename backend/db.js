const { Pool } = require('pg');  // PostgreSQL client
const dotenv = require('dotenv');
dotenv.config();

// Get the DATABASE_URL from the environment variables
const DATABASE_URL = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: DATABASE_URL,  // Use the connection string directly
  ssl: { rejectUnauthorized: false }  // SSL settings for production
});

// Schema setup and error handling
const setupSchema = async () => {
  const query = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Create tables if they don't exist
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255),
      email VARCHAR(255) UNIQUE,
      password VARCHAR(255),
      role VARCHAR(50) DEFAULT 'student'
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE,
      capacity INT,
      available BOOLEAN DEFAULT true
    );

    CREATE TABLE IF NOT EXISTS applications (
      id SERIAL PRIMARY KEY,
      student_id UUID REFERENCES users(id) ON DELETE CASCADE,
      room_id INT REFERENCES rooms(id) ON DELETE CASCADE,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS room_assignments (
      id SERIAL PRIMARY KEY,
      room_id INT REFERENCES rooms(id) ON DELETE CASCADE,
      student_id UUID REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

  try {
    await pool.query(query);
    console.log('Schema set up successfully');
    
    // Insert initial room data if rooms table is empty
    const roomCount = await pool.query('SELECT COUNT(*) FROM rooms');
    if (roomCount.rows[0].count === '0') {
      const insertRoomsQuery = `
        INSERT INTO rooms (name, capacity, available) VALUES
        ('Double Occupancy with Fan', 2, true),
        ('Double Occupancy with AC', 2, true),
        ('Single Occupancy with AC', 1, true),
        ('Single Occupancy with Bathroom and Kitchen', 1, true)
      `;
      await pool.query(insertRoomsQuery);
      console.log('Initial room data inserted');
    }

    // Create a test admin user if no users exist
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    if (userCount.rows[0].count === '0') {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const insertAdminQuery = `
        INSERT INTO users (name, email, password, role) VALUES
        ('Admin User', 'admin@example.com', $1, 'admin')
      `;
      await pool.query(insertAdminQuery, [hashedPassword]);
      console.log('Test admin user created');
    }
  } catch (error) {
    console.error('Error setting up schema:', error);
    throw error;
  }
};

const connectToDatabase = async () => {
  try {
    await pool.connect();
    console.log('Connected to the database');
    await setupSchema();  // Call schema setup when connected
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);  // Exit the app if DB connection fails
  }
};

module.exports = { pool, connectToDatabase };
