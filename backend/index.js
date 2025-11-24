

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
const dbURI = process.env.MONGODB_URI;
mongoose.connect(dbURI)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas!');
    startServer();
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
// 5. --- NEW: Use API Routers ---
// Mount the routers on specific URL paths
app.use('/api/tasks', taskRoutes); // Example for your old tasks
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);


// 6. Root Route (optional, for testing)
app.get('/', (req, res) => {
  res.json({ message: "Welcome to the Main API!" });
});

function startServer() {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}