const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for a task
const taskSchema = new Schema({
  description: {
    type: String,
    required: true // The description is mandatory
  },
  completed: {
    type: Boolean,
    default: false // By default, a new task is not completed
  },
  assignedTo: {
    type: String,
    default: 'Unassigned' // Default value if no one is assigned
  },
  project_id: {
    type: Schema.Types.ObjectId,
    ref: 'Project', // Reference to a Project model
    required: false
  }
}, {
  timestamps: true // Automatically adds `createdAt` and `updatedAt` fields
});

// Create a model from the schema and export it
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;