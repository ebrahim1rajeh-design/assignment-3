const express = require('express');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Simple welcome route
app.get('/', (req, res) => {
  res.json({ message: "Welcome to Retail Store RESTful API - Route Assignment 4" });
});

// =========================================================================
// Task 2: CRUD operations for Products table (2.5 Grades)
// =========================================================================

// Create a product
app.post('/products', async (req, res) => {
  try {
    const { ProductName, Price, StockQuantity, SupplierID } = req.body;
    if (!ProductName || Price === undefined || StockQuantity === undefined) {
      return res.status(400).json({ message: "ProductName, Price, and StockQuantity are required." });
    }
    const [result] = await db.query(
      `INSERT INTO Products (ProductName, Price, StockQuantity, SupplierID) VALUES (?, ?, ?, ?)`,
      [ProductName, Price, StockQuantity, SupplierID || null]
    );
    res.status(201).json({ message: "Product created successfully.", ProductID: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve all products
app.get('/products', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM Products`);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Specific operations (Must be defined before /products/:id)
// Task 7: Update price of 'Bread' to 25.00
app.put('/products/update-bread', async (req, res) => {
  try {
    const [result] = await db.query(`UPDATE Products SET Price = 25.00 WHERE ProductName = 'Bread'`);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Bread not found." });
    }
    res.status(200).json({ message: "Price of Bread updated to 25.00 successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Task 8: Delete the product 'Eggs'
app.delete('/products/eggs', async (req, res) => {
  try {
    const [result] = await db.query(`DELETE FROM Products WHERE ProductName = 'Eggs'`);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Eggs not found." });
    }
    res.status(200).json({ message: "Product Eggs deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve a product by ID
app.get('/products/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM Products WHERE ProductID = ?`, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a product by ID
app.put('/products/:id', async (req, res) => {
  try {
    const { ProductName, Price, StockQuantity, SupplierID } = req.body;
    const [result] = await db.query(
      `UPDATE Products SET 
        ProductName = COALESCE(?, ProductName),
        Price = COALESCE(?, Price),
        StockQuantity = COALESCE(?, StockQuantity),
        SupplierID = COALESCE(?, SupplierID)
       WHERE ProductID = ?`,
      [ProductName, Price, StockQuantity, SupplierID, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.status(200).json({ message: "Product updated successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a product by ID
app.delete('/products/:id', async (req, res) => {
  try {
    const [result] = await db.query(`DELETE FROM Products WHERE ProductID = ?`, [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.status(200).json({ message: "Product deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =========================================================================
// Task 3: CRUD operations for Suppliers table (2 Grades)
// =========================================================================

// Create a supplier
app.post('/suppliers', async (req, res) => {
  try {
    const { SupplierName, ContactNumber } = req.body;
    if (!SupplierName) {
      return res.status(400).json({ message: "SupplierName is required." });
    }
    const [result] = await db.query(
      `INSERT INTO Suppliers (SupplierName, ContactNumber) VALUES (?, ?)`,
      [SupplierName, ContactNumber || null]
    );
    res.status(201).json({ message: "Supplier created successfully.", SupplierID: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve all suppliers
app.get('/suppliers', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM Suppliers`);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update supplier information
app.put('/suppliers/:id', async (req, res) => {
  try {
    const { SupplierName, ContactNumber } = req.body;
    const [result] = await db.query(
      `UPDATE Suppliers SET 
        SupplierName = COALESCE(?, SupplierName),
        ContactNumber = COALESCE(?, ContactNumber)
       WHERE SupplierID = ?`,
      [SupplierName, ContactNumber, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Supplier not found." });
    }
    res.status(200).json({ message: "Supplier updated successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a supplier
app.delete('/suppliers/:id', async (req, res) => {
  try {
    const [result] = await db.query(`DELETE FROM Suppliers WHERE SupplierID = ?`, [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Supplier not found." });
    }
    res.status(200).json({ message: "Supplier deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =========================================================================
// Task 4: Manage Sales (1.5 Grades)
// =========================================================================

// Record a sale
app.post('/sales', async (req, res) => {
  try {
    const { ProductID, QuantitySold, SaleDate } = req.body;
    if (!ProductID || !QuantitySold) {
      return res.status(400).json({ message: "ProductID and QuantitySold are required." });
    }
    const date = SaleDate || new Date().toISOString().split('T')[0];
    const [result] = await db.query(
      `INSERT INTO Sales (ProductID, QuantitySold, SaleDate) VALUES (?, ?, ?)`,
      [ProductID, QuantitySold, date]
    );
    res.status(201).json({ message: "Sale recorded successfully.", SaleID: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve all sales
app.get('/sales', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM Sales`);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve sales for a specific product
app.get('/sales/product/:productId', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM Sales WHERE ProductID = ?`, [req.params.productId]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =========================================================================
// Task 5: Database Schema Modifications (2 Grades)
// =========================================================================

// Add a Category column to the Products table
app.post('/db/add-category', async (req, res) => {
  try {
    await db.query(`ALTER TABLE Products ADD COLUMN Category VARCHAR(100)`);
    res.status(200).json({ message: "Category column added to Products successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove the Category column
app.post('/db/remove-category', async (req, res) => {
  try {
    await db.query(`ALTER TABLE Products DROP COLUMN Category`);
    res.status(200).json({ message: "Category column removed from Products successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change ContactNumber to VARCHAR(15)
app.post('/db/modify-contact', async (req, res) => {
  try {
    await db.query(`ALTER TABLE Suppliers MODIFY COLUMN ContactNumber VARCHAR(15)`);
    res.status(200).json({ message: "ContactNumber modified to VARCHAR(15) successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a NOT NULL constraint to ProductName
app.post('/db/add-not-null-product-name', async (req, res) => {
  try {
    await db.query(`ALTER TABLE Products MODIFY COLUMN ProductName VARCHAR(255) NOT NULL`);
    res.status(200).json({ message: "NOT NULL constraint added to ProductName successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =========================================================================
// Task 6: Data Seeding Initialization Script/Endpoint (1.5 Grades)
// =========================================================================

app.post('/db/seed', async (req, res) => {
  try {
    // 6a. Add supplier 'FreshFoods'
    const [suppResult] = await db.query(
      `INSERT INTO Suppliers (SupplierName, ContactNumber) VALUES ('FreshFoods', '01001234567')`
    );
    const supplierId = suppResult.insertId;

    // 6b. Insert three products: Milk, Bread, Eggs
    const [p1] = await db.query(
      `INSERT INTO Products (ProductName, Price, StockQuantity, SupplierID) VALUES ('Milk', 15.00, 50, ?)`,
      [supplierId]
    );
    await db.query(
      `INSERT INTO Products (ProductName, Price, StockQuantity, SupplierID) VALUES ('Bread', 10.00, 30, ?)`,
      [supplierId]
    );
    await db.query(
      `INSERT INTO Products (ProductName, Price, StockQuantity, SupplierID) VALUES ('Eggs', 20.00, 40, ?)`,
      [supplierId]
    );

    // 6c. Add sale record of 2 units of 'Milk' made on '2025-05-20'
    await db.query(
      `INSERT INTO Sales (ProductID, QuantitySold, SaleDate) VALUES (?, 2, '2025-05-20')`,
      [p1.insertId]
    );

    res.status(201).json({ message: "Sample data seeded successfully according to Task 6 specifications." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =========================================================================
// Tasks 9 to 13: Reporting Endpoints
// =========================================================================

// 9. Total quantity sold for each product using SQL aggregate functions
app.get('/reports/total-sold', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.ProductID, 
        p.ProductName, 
        COALESCE(SUM(s.QuantitySold), 0) AS TotalQuantitySold
      FROM Products p
      LEFT JOIN Sales s ON p.ProductID = s.ProductID
      GROUP BY p.ProductID, p.ProductName
    `);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 10. Product with the highest stock quantity
app.get('/reports/highest-stock', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * 
      FROM Products 
      ORDER BY StockQuantity DESC 
      LIMIT 1
    `);
    res.status(200).json(rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 11. Suppliers whose names start with 'F'
app.get('/reports/suppliers-f', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * 
      FROM Suppliers 
      WHERE SupplierName LIKE 'F%'
    `);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 12. Products that have never been sold
app.get('/reports/unsold-products', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.* 
      FROM Products p
      LEFT JOIN Sales s ON p.ProductID = s.ProductID
      WHERE s.SaleID IS NULL
    `);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 13. All sales including Product name, Quantity sold, Sale date using SQL JOIN
app.get('/reports/sales-details', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.SaleID, 
        p.ProductName, 
        s.QuantitySold, 
        s.SaleDate
      FROM Sales s
      INNER JOIN Products p ON s.ProductID = p.ProductID
    `);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =========================================================================
// Tasks 14 to 16: User & Permission Management (DCL)
// =========================================================================

// 14. Create MySQL user 'store_manager' and grant SELECT, INSERT, UPDATE on all tables
app.post('/admin/create-store-manager', async (req, res) => {
  try {
    await db.query(`CREATE USER IF NOT EXISTS 'store_manager'@'%' IDENTIFIED BY 'StoreManagerPass123!';`);
    await db.query(`GRANT SELECT, INSERT, UPDATE ON retail_store.* TO 'store_manager'@'%';`);
    await db.query(`FLUSH PRIVILEGES;`);
    res.status(200).json({ message: "User store_manager created with SELECT, INSERT, UPDATE permissions." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 15. Revoke UPDATE permission from 'store_manager'
app.post('/admin/revoke-update', async (req, res) => {
  try {
    await db.query(`REVOKE UPDATE ON retail_store.* FROM 'store_manager'@'%';`);
    await db.query(`FLUSH PRIVILEGES;`);
    res.status(200).json({ message: "UPDATE permission revoked from store_manager successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 16. Grant DELETE permission to 'store_manager' only on the Sales table
app.post('/admin/grant-delete-sales', async (req, res) => {
  try {
    await db.query(`GRANT DELETE ON retail_store.Sales TO 'store_manager'@'%';`);
    await db.query(`FLUSH PRIVILEGES;`);
    res.status(200).json({ message: "DELETE permission on Sales table granted to store_manager successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
