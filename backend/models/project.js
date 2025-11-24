const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    default: 'Planning',
    enum: ['Planning', 'In Progress', 'Completed', 'On Hold'] // Optional: Restrict status values
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User', // This creates a reference to the User model
    required: true
  },
  teamMembers: [{
    type: Schema.Types.ObjectId,
    ref: 'User' // An array of references to Users
  }]
}, {
  timestamps: true
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;