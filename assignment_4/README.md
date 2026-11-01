# Route - Assignment 4: Node.js, Express.js, MySQL & Database Design

A complete solution for **Route Assignment 4**, covering:
1. **Part 1: ERD Diagram** for Musicana Records (Entities, Cardinalities, Relational Mapping).
2. **Part 2: Schema Mapping** for the User-Product ERD.
3. **Part 3: Retail Store RESTful API** (Using Node.js, Express.js, and `mysql2/promise` covering all 16 tasks).
4. **Bonus:** LeetCode #1581 (*Customer Who Visited but Did Not Make Any Transactions*).
5. **Postman Collection** with all requests pre-configured.

---

## 📁 Project Structure

```text
assignment_4/
├── server.js                          # Express REST API with all 16 endpoints
├── db.js                              # MySQL connection pool & auto-table initialization
├── schema.sql                         # Complete SQL script (DDL, DML, Reports, Permissions)
├── part1_part2_solutions.md          # Theoretical solutions & ERD mapping for Parts 1 & 2
├── bonus.txt                          # LeetCode 1581 SQL solution
├── Assignment4.postman_collection.json # Ready-to-import Postman Collection
├── package.json                       # Dependencies (express, mysql2, dotenv)
├── .env.example                       # Environment variables template
├── .env                               # Local database credentials
└── README.md                          # Full documentation
```

---

## 🎵 Part 1: Musicana Records ERD Summary

- **Musician**: (`musician_id` [PK], `name`, `street`, `city`, `phone_number`)
- **Instrument**: (`instrument_name` [PK], `musical_key`)
- **Album**: (`album_id` [PK], `title`, `copyright_date`, `producer_id` [FK -> Musician])
- **Song**: (`song_id` [PK], `title`, `author`, `album_id` [FK -> Album])
- **Relationships**:
  - Musician (M) -- Plays -- (N) Instrument -> Bridge: `Musician_Instrument`
  - Musician (1) -- Produces -- (N) Album -> FK in `Album(producer_id)`
  - Album (1) -- Contains -- (N) Songs -> FK in `Song(album_id)`
  - Musician (M) -- Performs -- (N) Song -> Bridge: `Song_Performance`

*Full diagram & explanation available in [`part1_part2_solutions.md`](./part1_part2_solutions.md).*

---

## 🗂️ Part 2: User-Product Schema Mapping

- **Users Table**: `Users(id [PK], firstName, lastName, userName, phone, email, password, role)`
- **Products Table**: `Products(id [PK], name, price, stock, isDeleted, userId [FK referencing Users(id)])`

---

## 🚀 Part 3: RESTful API Tasks & Endpoints

| Task # | Method | Endpoint | Description |
|---|---|---|---|
| **1** | — | `db.js` | MySQL pool setup using `mysql2/promise` & auto-table creation. |
| **2** | `POST` | `/products` | Create a product (`ProductName`, `Price`, `StockQuantity`, `SupplierID`). |
| **2** | `GET` | `/products` | Retrieve all products. |
| **2** | `GET` | `/products/:id` | Retrieve product by ID. |
| **2** | `PUT` | `/products/:id` | Update product by ID. |
| **2** | `DELETE` | `/products/:id` | Delete product by ID. |
| **3** | `POST` | `/suppliers` | Create a supplier (`SupplierName`, `ContactNumber`). |
| **3** | `GET` | `/suppliers` | Retrieve all suppliers. |
| **3** | `PUT` | `/suppliers/:id` | Update supplier by ID. |
| **3** | `DELETE` | `/suppliers/:id` | Delete supplier by ID. |
| **4** | `POST` | `/sales` | Record a sale (`ProductID`, `QuantitySold`, `SaleDate`). |
| **4** | `GET` | `/sales` | Retrieve all sales. |
| **4** | `GET` | `/sales/product/:productId` | Retrieve sales for a specific product. |
| **5a** | `POST` | `/db/add-category` | `ALTER TABLE Products ADD COLUMN Category VARCHAR(100)`. |
| **5b** | `POST` | `/db/remove-category` | `ALTER TABLE Products DROP COLUMN Category`. |
| **5c** | `POST` | `/db/modify-contact` | `ALTER TABLE Suppliers MODIFY COLUMN ContactNumber VARCHAR(15)`. |
| **5d** | `POST` | `/db/add-not-null-product-name` | `ALTER TABLE Products MODIFY COLUMN ProductName VARCHAR(255) NOT NULL`. |
| **6** | `POST` | `/db/seed` | Seed 'FreshFoods', 3 products ('Milk', 'Bread', 'Eggs'), and sale. |
| **7** | `PUT` | `/products/update-bread` | Update price of 'Bread' to 25.00. |
| **8** | `DELETE` | `/products/eggs` | Delete the product 'Eggs'. |
| **9** | `GET` | `/reports/total-sold` | Total quantity sold per product using SQL aggregate functions (`SUM`, `GROUP BY`). |
| **10** | `GET` | `/reports/highest-stock` | Product with the highest stock quantity (`ORDER BY StockQuantity DESC LIMIT 1`). |
| **11** | `GET` | `/reports/suppliers-f` | Suppliers whose names start with 'F' (`LIKE 'F%'`). |
| **12** | `GET` | `/reports/unsold-products` | Products that have never been sold (`LEFT JOIN ... WHERE SaleID IS NULL`). |
| **13** | `GET` | `/reports/sales-details` | All sales with Product name, Quantity, Date using SQL `JOIN`. |
| **14** | `POST` | `/admin/create-store-manager` | Create user `store_manager` and grant `SELECT`, `INSERT`, `UPDATE`. |
| **15** | `POST` | `/admin/revoke-update` | Revoke `UPDATE` from `store_manager`. |
| **16** | `POST` | `/admin/grant-delete-sales` | Grant `DELETE` on `Sales` table to `store_manager`. |

---

## 🏆 Bonus: LeetCode #1581

Located in [`bonus.txt`](./bonus.txt):
```sql
SELECT 
    v.customer_id, 
    COUNT(v.visit_id) AS count_no_trans
FROM 
    Visits v
LEFT JOIN 
    Transactions t ON v.visit_id = t.visit_id
WHERE 
    t.transaction_id IS NULL
GROUP BY 
    v.customer_id;
```

---

## ⚙️ How to Run

1. **Configure MySQL:**
   Ensure MySQL (e.g. from XAMPP or local MySQL Server) is running.
   Update `.env` with your MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=retail_store
   PORT=3000
   ```

2. **Start the API Server:**
   ```bash
   cd assignment_4
   npm install
   npm start
   ```
   *(or `npm run watch` for auto-restart on changes)*

3. **Import to Postman:**
   Import `Assignment4.postman_collection.json` into Postman to test all endpoints with 1-click.
