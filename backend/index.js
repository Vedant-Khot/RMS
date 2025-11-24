// 1. Import Packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// --- NEW: Import Route Files ---
const taskRoutes = require('./routes/taskRoutes'); // Assuming you move task routes too
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');

// 2. Create and configure the Express App
const app = express();
app.use(cors());
app.use(express.json());

// 3. Define Port
const PORT = process.env.PORT || 3000;

// 4. Connect to MongoDB
// ... (Your existing connection code remains the same)

// 5. --- NEW: Use API Routers ---
// Mount the routers on specific URL paths
app.use('/api/tasks', taskRoutes); // Example for your old tasks
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);


// 6. Root Route (optional, for testing)
app.get('/', (req, res) => {
  res.json({ message: "Welcome to the Main API!" });
});

// 7. Function to start the server
// ... (Your existing startServer function remains the same)