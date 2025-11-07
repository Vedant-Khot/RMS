const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for a task
const taskSchema = new Schema({
  description: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  assignedTo: {
    type: String,
    default: 'Unassigned'
  },
  project_id: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: false
  }
}, {
  timestamps: true
});

// Create a model from the schema
const Task = mongoose.model('Task', taskSchema);

// CRITICAL: Export the model so other files can use it
module.exports = Task; // <-- Check this line very carefully!