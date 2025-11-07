// 1. Import Packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // <-- 1. IMPORT THE CORS PACKAGE
require('dotenv').config();
// const Task = require('./models/Task'); // Your model is already imported

// 2. Create an Express App
const app = express();

// 3. Add Middleware
app.use(express.json());

app.use(cors()); // <-- 2. USE THE CORS MIDDLEWARE

// 4. Define Port
const PORT = process.env.PORT || 3000;

// 5. Connect to MongoDB
const dbURI = process.env.MONGODB_URI;
mongoose.connect(dbURI)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas!');
    startServer();
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });

// 6. API Routes

// -- GET /tasks: Retrieve all tasks --
// (No changes are needed here. It will automatically return the new fields)
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({});
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error });
  }
});

// -- POST /tasks: Create a new task --
// --- THIS IS THE UPDATED SECTION ---
app.post('/tasks', async (req, res) => {
  try {
    // Destructure all possible fields from the request body
    const { description, assignedTo, project_id } = req.body;

    // The description is still the only mandatory field
    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }

    // Create a new task object with the provided data
    const newTask = new Task({
      description,   // The description from the request
      assignedTo,    // The assignedTo from the request (will use schema default if not provided)
      project_id     // The project_id from the request (will be null if not provided)
    });

    const savedTask = await newTask.save(); // Save the new task to the DB
    res.status(201).json(savedTask); // Respond with the created task
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error: error });
  }
});


// 7. Root Route
app.get('/', (req, res) => {
  res.json({ message: "Welcome to our updated Task API!" });
});


// 8. Function to start the server
function startServer() {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}