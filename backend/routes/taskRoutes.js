const express = require('express');
const router = express.Router();
const Task = require('../models/task'); // Make sure the path to the model is correct
const { protect } = require('../middleware/authMiddleware'); // Import the authentication middleware

// --- Protect all routes in this file ---
// Any request to a route defined in this file must pass through the 'protect' middleware first.
// This ensures the user is authenticated and attaches req.user to the request.
router.use(protect);

// --- (CREATE) POST /api/tasks: Create a new task ---
router.post('/', async (req, res) => {
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

// --- (READ) GET /api/tasks: Fetch all tasks ---
// Note: You could enhance this later to filter tasks based on the logged-in user (req.user)
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({}); // Fetches all tasks for now
    res.status(200).json(tasks);
  } catch (error) {
    console.error("ERROR FETCHING TASKS:", error);
    res.status(500).json({ message: 'Error fetching tasks', error: error });
  }
});

// --- (READ) GET /api/tasks/:id: Fetch a single task by its ID ---
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("ERROR FETCHING TASK BY ID:", error);
    res.status(500).json({ message: 'Error fetching task', error: error });
  }
});

// --- (UPDATE) PATCH /api/tasks/:id: Update a task by its ID ---
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
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

// --- (DELETE) DELETE /api/tasks/:id: Delete a task by its ID ---
router.delete('/:id', async (req, res) => {
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


// Export the router so it can be used in index.js
module.exports = router;