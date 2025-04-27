const { Pool } = require('pg');  // PostgreSQL client
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
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

    // Create admin user if it doesn't exist
    await createAdminUser();
    await restoreGriseldaApplication();
  } catch (error) {
    console.error('Error setting up schema:', error);
    throw error;
  }
};

const createAdminUser = async () => {
    try {
        // Check if admin user exists
        const adminCheck = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@example.com']);
        
        if (adminCheck.rows.length === 0) {
            // Create admin user with hashed password
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await pool.query(
                'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
                ['Admin User', 'admin@example.com', hashedPassword, 'admin']
            );
            console.log('Admin user created successfully');
        } else {
            // Update existing admin user to ensure correct role
            await pool.query(
                'UPDATE users SET role = $1 WHERE email = $2',
                ['admin', 'admin@example.com']
            );
            console.log('Admin user role updated');
        }
    } catch (error) {
        console.error('Error creating/updating admin user:', error);
    }
};

// Restore Griselda's application
const restoreGriseldaApplication = async () => {
    try {
        // Check if Griselda exists
        const griseldaCheck = await pool.query('SELECT * FROM users WHERE email = $1', ['griselda@example.com']);
        if (griseldaCheck.rows.length === 0) {
            console.log('Griselda user not found');
            return;
        }

        const griseldaId = griseldaCheck.rows[0].id;

        // Check if application exists
        const appCheck = await pool.query('SELECT * FROM applications WHERE student_id = $1', [griseldaId]);
        if (appCheck.rows.length === 0) {
            // Create application if it doesn't exist
            await pool.query(
                'INSERT INTO applications (student_id, status) VALUES ($1, $2)',
                [griseldaId, 'approved']
            );
            console.log('Griselda application created');
        } else {
            // Update existing application
            await pool.query(
                'UPDATE applications SET status = $1 WHERE student_id = $2',
                ['approved', griseldaId]
            );
            console.log('Griselda application restored');
        }
    } catch (error) {
        console.error('Error restoring Griselda application:', error);
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
