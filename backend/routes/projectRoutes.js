const express = require('express');
const router = express.Router();
const Project = require('../models/project');
const { protect } = require('../middleware/authMiddleware');

// Apply the 'protect' middleware to all routes in this file
router.use(protect);

// --- (CREATE) POST /api/projects ---
router.post('/', async (req, res) => {
  try {
    const { name, description, deadline, teamMembers } = req.body;
    const project = new Project({
      name,
      description,
      deadline,
      teamMembers,
      createdBy: req.user._id // Get the creator's ID from the logged-in user
    });
    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

// --- (READ) GET /api/projects (Get projects created by the user) ---
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({ createdBy: req.user._id });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

// --- (READ by ID) GET /api/projects/:id ---
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('teamMembers', 'name email');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    // Optional: Add a check to ensure the user is allowed to see this project
    if (project.createdBy.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not Authorized' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

// --- (UPDATE) PATCH /api/projects/:id ---
router.patch('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }
    if (project.createdBy.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not Authorized' });
    }
    
    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

// --- (DELETE) DELETE /api/projects/:id ---
router.delete('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (project.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not Authorized' });
        }
        
        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

module.exports = router;