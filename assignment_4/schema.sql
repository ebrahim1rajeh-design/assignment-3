-- =====================================================================
-- Route - Assignment 4: Complete SQL Script
-- Scenario: Retail Store Database (Products, Suppliers, Sales)
-- =====================================================================

-- 1. Create Database and Tables
CREATE DATABASE IF NOT EXISTS retail_store;
USE retail_store;

-- Suppliers Table
CREATE TABLE IF NOT EXISTS Suppliers (
    SupplierID INT AUTO_INCREMENT PRIMARY KEY,
    SupplierName VARCHAR(255) NOT NULL,
    ContactNumber VARCHAR(50)
);

-- Products Table
CREATE TABLE IF NOT EXISTS Products (
    ProductID INT AUTO_INCREMENT PRIMARY KEY,
    ProductName VARCHAR(255),
    Price DECIMAL(10, 2),
    StockQuantity INT,
    SupplierID INT,
    FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID) ON DELETE SET NULL
);

-- Sales Table
CREATE TABLE IF NOT EXISTS Sales (
    SaleID INT AUTO_INCREMENT PRIMARY KEY,
    ProductID INT,
    QuantitySold INT,
    SaleDate DATE,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE
);

-- =====================================================================
-- Task 5: Database Schema Modifications (DDL)
-- =====================================================================

-- 5a. Add Category column to the Products table
ALTER TABLE Products ADD COLUMN Category VARCHAR(100);

-- 5b. Remove the Category column
ALTER TABLE Products DROP COLUMN Category;

-- 5c. Change ContactNumber to VARCHAR(15)
ALTER TABLE Suppliers MODIFY COLUMN ContactNumber VARCHAR(15);

-- 5d. Add a NOT NULL constraint to ProductName
ALTER TABLE Products MODIFY COLUMN ProductName VARCHAR(255) NOT NULL;

-- =====================================================================
-- Task 6: Data Seeding
-- =====================================================================

-- 6a. Add a supplier with name 'FreshFoods' and contact number '01001234567'
INSERT INTO Suppliers (SupplierName, ContactNumber) 
VALUES ('FreshFoods', '01001234567');

-- 6b. Insert three products provided by 'FreshFoods' (assuming SupplierID = 1)
INSERT INTO Products (ProductName, Price, StockQuantity, SupplierID) VALUES 
('Milk', 15.00, 50, 1),
('Bread', 10.00, 30, 1),
('Eggs', 20.00, 40, 1);

-- 6c. Add a record for the sale of 2 units of 'Milk' made on '2025-05-20'
INSERT INTO Sales (ProductID, QuantitySold, SaleDate) 
VALUES ((SELECT ProductID FROM Products WHERE ProductName = 'Milk' LIMIT 1), 2, '2025-05-20');

-- =====================================================================
-- Tasks 7 & 8: Data Updates and Deletions
-- =====================================================================

-- 7. Update the price of 'Bread' to 25.00
UPDATE Products 
SET Price = 25.00 
WHERE ProductName = 'Bread';

-- 8. Delete the product 'Eggs'
DELETE FROM Products 
WHERE ProductName = 'Eggs';

-- =====================================================================
-- Tasks 9 to 13: Reporting Queries
-- =====================================================================

-- 9. Retrieve the total quantity sold for each product using SQL aggregate functions
SELECT 
    p.ProductID, 
    p.ProductName, 
    COALESCE(SUM(s.QuantitySold), 0) AS TotalQuantitySold
FROM Products p
LEFT JOIN Sales s ON p.ProductID = s.ProductID
GROUP BY p.ProductID, p.ProductName;

-- 10. Retrieve the product with the highest stock quantity
SELECT * 
FROM Products 
ORDER BY StockQuantity DESC 
LIMIT 1;

-- 11. Retrieve suppliers whose names start with 'F'
SELECT * 
FROM Suppliers 
WHERE SupplierName LIKE 'F%';

-- 12. Retrieve all products that have never been sold
SELECT p.* 
FROM Products p
LEFT JOIN Sales s ON p.ProductID = s.ProductID
WHERE s.SaleID IS NULL;

-- 13. Retrieve all sales including: Product name, Quantity sold, Sale date using SQL JOIN
SELECT 
    s.SaleID, 
    p.ProductName, 
    s.QuantitySold, 
    s.SaleDate
FROM Sales s
INNER JOIN Products p ON s.ProductID = p.ProductID;

-- =====================================================================
-- Tasks 14 to 16: User & Permission Management (DCL)
-- =====================================================================

-- 14. Create user 'store_manager' and grant SELECT, INSERT, UPDATE on all tables
CREATE USER IF NOT EXISTS 'store_manager'@'%' IDENTIFIED BY 'StoreManagerPass123!';
GRANT SELECT, INSERT, UPDATE ON retail_store.* TO 'store_manager'@'%';
FLUSH PRIVILEGES;

-- 15. Revoke UPDATE permission from 'store_manager'
REVOKE UPDATE ON retail_store.* FROM 'store_manager'@'%';
FLUSH PRIVILEGES;

-- 16. Grant DELETE permission to 'store_manager' only on the Sales table
GRANT DELETE ON retail_store.Sales TO 'store_manager'@'%';
FLUSH PRIVILEGES;
