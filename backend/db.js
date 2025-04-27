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

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255),
      email VARCHAR(255) UNIQUE,
      password VARCHAR(255),
      role VARCHAR(50)
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      capacity INT,
      available BOOLEAN
    );

    CREATE TABLE IF NOT EXISTS applications (
      id SERIAL PRIMARY KEY,
      student_id UUID REFERENCES users(id),
      room_id INT REFERENCES rooms(id),
      status VARCHAR(50)
    );

    CREATE TABLE IF NOT EXISTS room_assignments (
      id SERIAL PRIMARY KEY,
      room_id INT REFERENCES rooms(id),
      student_id UUID REFERENCES users(id)
    );
`;

  try {
    await pool.query(query);
    console.log('Schema set up successfully');
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
