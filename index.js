const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const USERS_FILE_PATH = path.join(__dirname, 'users.json');

// Middleware to parse JSON bodies
app.use(express.json());

// Helper function to read users from users.json using the fs module
const readUsersFromFile = async () => {
  try {
    const data = await fs.readFile(USERS_FILE_PATH, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (error) {
    if (error.code === 'ENOENT') {
      // If file does not exist, initialize it with an empty array
      await fs.writeFile(USERS_FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    throw error;
  }
};

// Helper function to write users to users.json using the fs module
const writeUsersToFile = async (users) => {
  await fs.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
};

// -------------------------------------------------------------
// Part 2: Express CRUD Operations using fs Module
// -------------------------------------------------------------

// 4. GET /user/getByName - Get user by name (query parameter)
// Placed before /user/:id so it is not captured as an id parameter
app.get('/user/getByName', async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ message: "User name not found." });
    }

    const users = await readUsersFromFile();
    const user = users.find(u => u.name && u.name.toLowerCase() === String(name).toLowerCase());

    if (!user) {
      return res.status(404).json({ message: "User name not found." });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
});

// 6. GET /user/filter - Filter users by minimum age (query parameter)
// Placed before /user/:id so it is not captured as an id parameter
app.get('/user/filter', async (req, res) => {
  try {
    const { minAge } = req.query;
    if (minAge === undefined) {
      return res.status(400).json({ message: "Please provide minAge query parameter." });
    }

    const users = await readUsersFromFile();
    const filteredUsers = users.filter(u => Number(u.age) >= Number(minAge));

    if (filteredUsers.length === 0) {
      return res.status(404).json({ message: "no user found" });
    }

    return res.status(200).json(filteredUsers);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
});

// 5. GET /user - Get all users
app.get('/user', async (req, res) => {
  try {
    const users = await readUsersFromFile();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
});

// 7. GET /user/:id - Get user by ID
app.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const users = await readUsersFromFile();
    const user = users.find(u => String(u.id) === String(id));

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
});

// 1. POST /user - Add a new user (ensure email does not already exist)
app.post('/user', async (req, res) => {
  try {
    const { name, age, email } = req.body;

    if (!name || age === undefined || !email) {
      return res.status(400).json({ message: "name, age, and email are required." });
    }

    const users = await readUsersFromFile();

    // Check if email already exists
    const emailExists = users.some(u => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return res.status(409).json({ message: "Email already exists." });
    }

    // Generate new unique ID
    const newId = users.length > 0 ? Math.max(...users.map(u => Number(u.id) || 0)) + 1 : 1;

    const newUser = {
      id: newId,
      name,
      age: Number(age),
      email
    };

    users.push(newUser);
    await writeUsersToFile(users);

    return res.status(201).json({ message: "User added successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
});

// 2. PATCH /user/:id - Update existing user's name, age, or email by ID
app.patch('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, email } = req.body;

    const users = await readUsersFromFile();
    const userIndex = users.findIndex(u => String(u.id) === String(id));

    if (userIndex === -1) {
      return res.status(404).json({ message: "User ID not found." });
    }

    // Check which fields are provided for updating
    const updatedFields = [];
    if (name !== undefined) {
      users[userIndex].name = name;
      updatedFields.push('name');
    }
    if (age !== undefined) {
      users[userIndex].age = Number(age);
      updatedFields.push('age');
    }
    if (email !== undefined) {
      users[userIndex].email = email;
      updatedFields.push('email');
    }

    await writeUsersToFile(users);

    // If only one specific field was updated (e.g., age), provide "User <field> updated successfully."
    let message = "User updated successfully.";
    if (updatedFields.length === 1) {
      message = `User ${updatedFields[0]} updated successfully.`;
    }

    return res.status(200).json({ message });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
});

// 3. DELETE /user{/:id} - Delete user by ID (retrieved from optional params OR request body)
const deleteUserHandler = async (req, res) => {
  try {
    // ID can come from params (/user/:id) or request body ({ id: ... })
    const id = req.params.id || (req.body && req.body.id);

    if (!id) {
      return res.status(404).json({ message: "User ID not found." });
    }

    const users = await readUsersFromFile();
    const userIndex = users.findIndex(u => String(u.id) === String(id));

    if (userIndex === -1) {
      return res.status(404).json({ message: "User ID not found." });
    }

    users.splice(userIndex, 1);
    await writeUsersToFile(users);

    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

app.delete('/user/:id', deleteUserHandler);
app.delete('/user', deleteUserHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
