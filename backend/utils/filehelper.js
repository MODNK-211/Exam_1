const pool = require('../db');  // Assuming you have a db.js file that exports the pool connection

// Generic function to fetch data from a given table
async function readFile(tableName) {
  try {
    // Fetch data from the specified table
    const result = await pool.query(`SELECT * FROM ${tableName}`);
    return result.rows;
  } catch (error) {
    console.error('Error reading data from database:', error);
    throw new Error('Error reading data');
  }
}

// Generic function to save data to a specified table
async function writeFile(tableName, data) {
  try {
    // Depending on the table, you'll want to build an appropriate insert or update query
    // Example: Assuming each table has an auto-incrementing ID or a unique identifier
    
    // Start a transaction
    await pool.query('BEGIN');

    // Loop through data and insert into the corresponding table
    for (let item of data) {
      const columns = Object.keys(item).join(', ');
      const values = Object.values(item);
      const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

      const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
      await pool.query(query, values);
    }

    // Commit the transaction
    await pool.query('COMMIT');
    console.log('Data successfully written to the database');
  } catch (error) {
    // Rollback the transaction in case of error
    await pool.query('ROLLBACK');
    console.error('Error writing data to database:', error);
    throw new Error('Error writing data');
  }
}

module.exports = { readFile, writeFile };
