// 1. Import Packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import your Task model
const Task = require('./models/task');

// 2. Create and configure the Express App
const app = express();
app.use(cors());
app.use(express.json());

// 3. Define Port
const PORT = process.env.PORT || 3000;

// 4. Connect to MongoDB
const dbURI = process.env.MONGODB_URI;
mongoose.connect(dbURI)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas!');
    startServer();
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });

// 5. --- API ROUTES ---

// --- (CREATE) POST /tasks: Create a new task ---
// This is your "insert" endpoint
app.post('/tasks', async (req, res) => {
  try {
    const { description, assignedTo, project_id } = req.body;
    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }
    const newTask = new Task({ description, assignedTo, project_id });
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    console.error("ERROR CREATING TASK:", error);
    res.status(500).json({ message: 'Error creating task', error: error });
  }
});

// --- (READ) GET /tasks: Fetch all tasks ---
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({});
    res.status(200).json(tasks);
  } catch (error) {
    console.error("ERROR FETCHING TASKS:", error);
    res.status(500).json({ message: 'Error fetching tasks', error: error });
  }
});

// --- (READ) GET /tasks/:id: Fetch a single task by its ID ---
app.get('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the URL parameters
    const task = await Task.findById(id);

    if (!task) {
      // If no task is found with that ID, return a 404 error
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("ERROR FETCHING TASK BY ID:", error);
    res.status(500).json({ message: 'Error fetching task', error: error });
  }
});

// --- (UPDATE) PATCH /tasks/:id: Update a task by its ID ---
app.patch('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Find the task by ID and update it with the data from the request body.
    // { new: true } ensures that the updated document is returned.
    const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("ERROR UPDATING TASK:", error);
    res.status(500).json({ message: 'Error updating task', error: error });
  }
});

// --- (DELETE) DELETE /tasks/:id: Delete a task by its ID ---
app.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error("ERROR DELETING TASK:", error);
    res.status(500).json({ message: 'Error deleting task', error: error });
  }
});


// 6. Root Route
app.get('/', (req, res) => {
  res.json({ message: "Welcome to the fully functional Task API!" });
});

// 7. Function to start the server
function startServer() {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}