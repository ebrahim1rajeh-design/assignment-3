# Route - Assignment 3: Node Internals & Express.js CRUD API

A full solution for **Route Assignment 3**, covering Node.js Internals, Express.js RESTful CRUD operations persisted with the `fs` module into `users.json`, LeetCode Bonus solution, Postman Collection, and Git/GitHub instructions.

---

## 📁 Project Structure

```text
assigement_1/
├── index.js                             # Express server and CRUD API endpoints
├── users.json                           # JSON file database (managed via fs module)
├── bonus.js                             # LeetCode #14: Longest Common Prefix solution
├── part1_answers.md                     # Detailed theoretical answers for Part 1 (Node Internals)
├── Assignment3.postman_collection.json  # Exported Postman collection for all endpoints
├── package.json                         # Project dependencies and npm scripts
├── .gitignore                           # Git ignore file for node_modules and logs
└── README.md                            # Comprehensive documentation & setup guide
```

---

## 🚀 Getting Started in VS Code

### 1. Open Project in VS Code
Open VS Code, press `Ctrl + O` (or `File -> Open Folder...`), and select the folder:
`c:\Users\Ebrahim Rajeh\Downloads\assigement_1`

### 2. Install Dependencies
Open the integrated terminal in VS Code (`Ctrl + ~`) and run:
```bash
npm install
```

### 3. Run the Server
- To start the server:
  ```bash
  npm start
  ```
  *(or `node index.js`)*
- The server will run at:
  ```
  http://localhost:3000
  ```

---

## 📮 Postman Setup & Testing

### How to Import the Collection:
1. Open **Postman**.
2. Click the **Import** button in the top-left corner.
3. Drag and drop the `Assignment3.postman_collection.json` file located in this project folder (or click **files** and select it).
4. The collection **Route - Assignment 3** will appear in your sidebar with all 8 requests ready to run!

### Included Postman Endpoints:
| # | Name in Postman | Method | URL | Description |
|---|-----------------|--------|-----|-------------|
| 1 | `1. Add User` | `POST` | `{{baseUrl}}/user` | Adds a new user; validates duplicate email. |
| 2 | `2. Update User` | `PATCH` | `{{baseUrl}}/user/:id` | Updates user's name, age, or email by ID. |
| 3 | `3. Delete User (by URL Param)` | `DELETE` | `{{baseUrl}}/user/:id` | Deletes user by ID passed in params. |
| 4 | `4. Delete User (by Request Body)` | `DELETE` | `{{baseUrl}}/user` | Deletes user by ID passed in JSON body. |
| 5 | `5. Get User By Name` | `GET` | `{{baseUrl}}/user/getByName?name=ali` | Searches user by name query param. |
| 6 | `6. Get All Users` | `GET` | `{{baseUrl}}/user` | Retrieves all users from `users.json`. |
| 7 | `7. Filter Users by Minimum Age` | `GET` | `{{baseUrl}}/user/filter?minAge=25` | Filters users with age >= `minAge`. |
| 8 | `8. Get User by ID` | `GET` | `{{baseUrl}}/user/:id` | Retrieves a single user by ID. |

> **Pro Tip:** Make sure to save any changes you make in Postman (`Ctrl + S`).

---

## 📖 API Documentation & Expected Responses

### 1. Add User
- **URL:** `POST /user`
- **Request Body:**
  ```json
  {
    "name": "User 1",
    "age": 27,
    "email": "user@email.com"
  }
  ```
- **Responses:**
  - Success (`201 Created`):
    ```json
    { "message": "User added successfully." }
    ```
  - Email Already Exists (`409 Conflict`):
    ```json
    { "message": "Email already exists." }
    ```

---

### 2. Update User
- **URL:** `PATCH /user/:id`
- **Request Body:**
  ```json
  {
    "age": 30
  }
  ```
- **Responses:**
  - Success (`200 OK`):
    ```json
    { "message": "User age updated successfully." }
    ```
  - Not Found (`404 Not Found`):
    ```json
    { "message": "User ID not found." }
    ```

---

### 3. Delete User
- **URL:** `DELETE /user/:id` OR `DELETE /user` with body:
  ```json
  {
    "id": 1
  }
  ```
- **Responses:**
  - Success (`200 OK`):
    ```json
    { "message": "User deleted successfully." }
    ```
  - Not Found (`404 Not Found`):
    ```json
    { "message": "User ID not found." }
    ```

---

### 4. Get User by Name
- **URL:** `GET /user/getByName?name=ali`
- **Responses:**
  - Success (`200 OK`):
    ```json
    {
      "id": 1,
      "name": "ali",
      "age": 27,
      "email": "user@email.com"
    }
    ```
  - Not Found (`404 Not Found`):
    ```json
    { "message": "User name not found." }
    ```

---

### 5. Get All Users
- **URL:** `GET /user`
- **Response (`200 OK`):**
  ```json
  [
    {
      "id": 1,
      "name": "ali",
      "age": 27,
      "email": "user@email.com"
    },
    {
      "id": 2,
      "name": "ahmed",
      "age": 26,
      "email": "user2@email.com"
    }
  ]
  ```

---

### 6. Filter Users by Minimum Age
- **URL:** `GET /user/filter?minAge=25`
- **Responses:**
  - Success (`200 OK`):
    ```json
    [
      {
        "id": 1,
        "name": "ali",
        "age": 27,
        "email": "user@email.com"
      },
      {
        "id": 2,
        "name": "ahmed",
        "age": 26,
        "email": "user2@email.com"
      }
    ]
    ```
  - No User Found (`404 Not Found`):
    ```json
    { "message": "no user found" }
    ```

---

### 7. Get User by ID
- **URL:** `GET /user/:id`
- **Responses:**
  - Success (`200 OK`):
    ```json
    {
      "id": 1,
      "name": "ali",
      "age": 27,
      "email": "user@email.com"
    }
    ```
  - Not Found (`404 Not Found`):
    ```json
    { "message": "User not found." }
    ```

---

## 💡 Part 1: Node Internals (Theoretical Answers)

All 6 questions are completely answered in detail in [`part1_answers.md`](./part1_answers.md):
1. **What is the Node.js Event Loop?**
2. **What is Libuv and What Role Does It Play in Node.js?**
3. **How Does Node.js Handle Asynchronous Operations Under the Hood?**
4. **What is the Difference Between the Call Stack, Event Queue, and Event Loop?**
5. **What is the Node.js Thread Pool and How to Set the Thread Pool Size?**
6. **How Does Node.js Handle Blocking and Non-Blocking Code Execution?**

---

## 🏆 Bonus: Longest Common Prefix (LeetCode #14)

Located in [`bonus.js`](./bonus.js).

To test the bonus solution locally, run:
```bash
node bonus.js
```

---

## 🐙 How to Push to GitHub

Follow these steps to push this project to your GitHub repository:

1. **Check Git Status in VS Code Terminal:**
   ```bash
   git status
   ```

2. **Stage and Commit all files:**
   ```bash
   git add .
   git commit -m "Complete Route Assignment 3: Node Internals, Express CRUD, Postman Collection & LeetCode Bonus"
   ```

3. **Create a new Repository on GitHub:**
   - Go to [https://github.com/new](https://github.com/new)
   - Repository name: e.g. `route-assignment-3` or `Node-Assignment3`
   - Set to **Public**
   - Do **NOT** check "Initialize with README" (we already have one).
   - Click **Create repository**.

4. **Link and Push:**
   Replace `<YOUR_GITHUB_USERNAME>` and `<REPO_NAME>` with your GitHub details:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<REPO_NAME>.git
   git push -u origin main
   ```
