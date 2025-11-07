// 1. Import Packages at the TOP
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// CRITICAL: Import your Task model. This must be below the other imports.
// The require statement returns what module.exports was set to.
// So, the 'Task' constant should now hold your model.
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

// 5. API Routes
// This route handler needs to be able to "see" the Task constant defined above.
app.get('/tasks', async (req, res) => {
  try {
    // If 'Task' is not defined here, you will get the ReferenceError.
    const tasks = await Task.find({}); 
    res.status(200).json(tasks);
  } catch (error) {
    console.error("ERROR FETCHING TASKS:", error);
    res.status(500).json({ message: 'Error fetching tasks', error: error });
  }
});

// (Your other routes like POST /tasks would go here)
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

// 6. Root Route
app.get('/', (req, res) => {
  res.json({ message: "Welcome to our Task API!" });
});

// 7. Function to start the server
function startServer() {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}