const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const filePath = path.join(__dirname, 'users.json');

// Middleware to parse incoming JSON in request body
app.use(express.json());

// Helper function to read users directly from JSON file using fs module
const readUsers = () => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
    return [];
  }
  const fileData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileData || '[]');
};

// Helper function to write users directly into JSON file using fs module
const writeUsers = (users) => {
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf-8');
};

// =========================================================================
// Part 2: Simple CRUD Operations Using Express.js (Ordered 1 to 7)
// =========================================================================

// 1. Create an API that adds a new user to your users stored in a JSON file.
//    (ensure that the email of the new user doesn't exist before)
//    URL: POST /user
app.post('/user', (req, res) => {
  const { name, age, email } = req.body;

  if (!name || age === undefined || !email) {
    return res.status(400).json({ message: "Name, age, and email are required." });
  }

  const users = readUsers();

  // Check if email already exists
  const isEmailExist = users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  if (isEmailExist) {
    return res.status(409).json({ message: "Email already exists." });
  }

  // Generate new ID (auto-increment)
  const id = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
  const newUser = { id, name, age: Number(age), email };

  users.push(newUser);
  writeUsers(users);

  return res.status(201).json({ message: "User added successfully." });
});

// 2. Create an API that updates an existing user's name, age, or email by their ID.
//    The user ID should be retrieved from the params.
//    URL: PATCH /user/:id
app.patch('/user/:id', (req, res) => {
  const { id } = req.params;
  const { name, age, email } = req.body;

  const users = readUsers();
  const user = users.find((u) => String(u.id) === String(id));

  if (!user) {
    return res.status(404).json({ message: "User ID not found." });
  }

  // Update provided fields
  if (name !== undefined) user.name = name;
  if (age !== undefined) user.age = Number(age);
  if (email !== undefined) user.email = email;

  writeUsers(users);

  // Return message matching the updated field or generic success
  if (age !== undefined && name === undefined && email === undefined) {
    return res.status(200).json({ message: "User age updated successfully." });
  }
  if (name !== undefined && age === undefined && email === undefined) {
    return res.status(200).json({ message: "User name updated successfully." });
  }
  if (email !== undefined && age === undefined && name === undefined) {
    return res.status(200).json({ message: "User email updated successfully." });
  }

  return res.status(200).json({ message: "User updated successfully." });
});

// 3. Create an API that deletes a User by ID.
//    The user id should be retrieved from either the request body or optional params.
//    URL: DELETE /user/:id OR DELETE /user (with id in body)
const deleteUser = (req, res) => {
  const id = req.params.id || (req.body && req.body.id);

  if (!id) {
    return res.status(404).json({ message: "User ID not found." });
  }

  const users = readUsers();
  const index = users.findIndex((u) => String(u.id) === String(id));

  if (index === -1) {
    return res.status(404).json({ message: "User ID not found." });
  }

  users.splice(index, 1);
  writeUsers(users);

  return res.status(200).json({ message: "User deleted successfully." });
};

app.delete('/user/:id', deleteUser);
app.delete('/user', deleteUser);

// 4. Create an API that gets a user by their name.
//    The name will be provided as a query parameter.
//    URL: GET /user/getByName?name=ali
app.get('/user/getByName', (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(404).json({ message: "User name not found." });
  }

  const users = readUsers();
  const user = users.find((u) => u.name && u.name.toLowerCase() === String(name).toLowerCase());

  if (!user) {
    return res.status(404).json({ message: "User name not found." });
  }

  return res.status(200).json(user);
});

// 5. Create an API that gets all users from the JSON file.
//    URL: GET /user
app.get('/user', (req, res) => {
  const users = readUsers();
  return res.status(200).json(users);
});

// 6. Create an API that filters users by minimum age.
//    URL: GET /user/filter?minAge=25
app.get('/user/filter', (req, res) => {
  const { minAge } = req.query;

  if (minAge === undefined) {
    return res.status(400).json({ message: "minAge query parameter is required." });
  }

  const users = readUsers();
  const filteredUsers = users.filter((u) => Number(u.age) >= Number(minAge));

  if (filteredUsers.length === 0) {
    return res.status(404).json({ message: "no user found" });
  }

  return res.status(200).json(filteredUsers);
});

// 7. Create an API that gets User by ID.
//    URL: GET /user/:id
app.get('/user/:id', (req, res) => {
  const { id } = req.params;

  const users = readUsers();
  const user = users.find((u) => String(u.id) === String(id));

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  return res.status(200).json(user);
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
