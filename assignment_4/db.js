const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const DB_NAME = process.env.DB_NAME || 'retail_store';

let pool;

const initDB = async () => {
  try {
    // 1. Connect without database to ensure DB exists
    const rootConn = await mysql.createConnection(dbConfig);
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    await rootConn.end();

    // 2. Create the connection pool with the database selected
    pool = mysql.createPool({
      ...dbConfig,
      database: DB_NAME
    });

    // 3. Create Required Tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Suppliers (
        SupplierID INT AUTO_INCREMENT PRIMARY KEY,
        SupplierName VARCHAR(255) NOT NULL,
        ContactNumber VARCHAR(50)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Products (
        ProductID INT AUTO_INCREMENT PRIMARY KEY,
        ProductName VARCHAR(255),
        Price DECIMAL(10, 2),
        StockQuantity INT,
        SupplierID INT,
        FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID) ON DELETE SET NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Sales (
        SaleID INT AUTO_INCREMENT PRIMARY KEY,
        ProductID INT,
        QuantitySold INT,
        SaleDate DATE,
        FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE
      );
    `);

    console.log(`✅ Database & Tables initialized successfully on database: ${DB_NAME}`);
  } catch (error) {
    console.warn(`⚠️ MySQL Connection notice: ${error.message}`);
    console.warn('👉 Please ensure your MySQL server (e.g. XAMPP, WAMP, or MySQL service) is running with credentials from .env');
    // Still create pool so endpoints fail gracefully with JSON errors instead of crashing
    pool = mysql.createPool({
      ...dbConfig,
      database: DB_NAME
    });
  }
};

initDB();

module.exports = {
  getPool: () => pool,
  query: async (sql, params) => {
    if (!pool) {
      throw new Error("Database pool is not initialized yet. Ensure MySQL is running.");
    }
    return pool.query(sql, params);
  }
};
