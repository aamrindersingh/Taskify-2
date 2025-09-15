const express = require('express');
const { 
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
  addSubTask,
  getTasksByCategory,
  getOverdueTasks
} = require('../controllers/taskController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// @route   GET /api/tasks
// @desc    Get all tasks for authenticated user
// @access  Private
router.get('/', getTasks);

// @route   GET /api/tasks/overdue
// @desc    Get overdue tasks
// @access  Private
router.get('/overdue', getOverdueTasks);

// @route   GET /api/tasks/category/:category
// @desc    Get tasks by category
// @access  Private
router.get('/category/:category', getTasksByCategory);

// @route   GET /api/tasks/:id
// @desc    Get single task by ID
// @access  Private
router.get('/:id', getTask);

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private
router.post('/', createTask);

// @route   PATCH /api/tasks/:id
// @desc    Update task
// @access  Private
router.patch('/:id', updateTask);

// @route   PATCH /api/tasks/:id/toggle
// @desc    Toggle task completion
// @access  Private
router.patch('/:id/toggle', toggleTask);

// @route   POST /api/tasks/:id/subtasks
// @desc    Add subtask to task
// @access  Private
router.post('/:id/subtasks', addSubTask);

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', deleteTask);

module.exports = router;
