const Task = require('../models/Task');

// @desc    Get all tasks for authenticated user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { category, priority, isDone, search, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 50 } = req.query;
    
    // Build filter object
    const filter = { userId: req.user._id };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }
    
    if (isDone !== undefined) {
      filter.isDone = isDone === 'true';
    }
    
    // Build search query
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const tasks = await Task.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Task.countDocuments(filter);

    // Get statistics
    const stats = await Task.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$isDone', true] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$isDone', false] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$isDone', false] },
                    { $lt: ['$dueDate', new Date()] },
                    { $ne: ['$dueDate', null] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    res.json({
      tasks,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: tasks.length,
        totalItems: total
      },
      stats: stats[0] || { total: 0, completed: 0, pending: 0, overdue: 0 }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      message: 'Server error fetching tasks'
    });
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid task ID'
      });
    }

    res.status(500).json({
      message: 'Server error fetching task'
    });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, category, priority, dueDate, tags } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        message: 'Task title is required'
      });
    }

    if (!category) {
      return res.status(400).json({
        message: 'Task category is required'
      });
    }

    // Create task
    const task = new Task({
      userId: req.user._id,
      title: title.trim(),
      description: description?.trim() || '',
      category,
      priority: priority || 'medium',
      dueDate: dueDate || null,
      tags: tags || []
    });

    await task.save();

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      message: 'Server error creating task'
    });
  }
};

// @desc    Update task
// @route   PATCH /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    // Update fields
    const updateFields = ['title', 'description', 'category', 'priority', 'isDone', 'dueDate', 'tags'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    await task.save();

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid task ID'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      message: 'Server error updating task'
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    res.json({
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid task ID'
      });
    }

    res.status(500).json({
      message: 'Server error deleting task'
    });
  }
};

// @desc    Toggle task completion
// @route   PATCH /api/tasks/:id/toggle
// @access  Private
const toggleTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    await task.toggleCompletion();

    res.json({
      message: `Task marked as ${task.isDone ? 'completed' : 'pending'}`,
      task
    });
  } catch (error) {
    console.error('Toggle task error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid task ID'
      });
    }

    res.status(500).json({
      message: 'Server error toggling task'
    });
  }
};

// @desc    Add subtask to task
// @route   POST /api/tasks/:id/subtasks
// @access  Private
const addSubTask = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: 'Subtask title is required'
      });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    await task.addSubTask(title.trim());

    res.status(201).json({
      message: 'Subtask added successfully',
      task
    });
  } catch (error) {
    console.error('Add subtask error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid task ID'
      });
    }

    res.status(500).json({
      message: 'Server error adding subtask'
    });
  }
};

// @desc    Get tasks by category
// @route   GET /api/tasks/category/:category
// @access  Private
const getTasksByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const tasks = await Task.findByCategory(req.user._id, category);

    res.json({
      category,
      tasks,
      count: tasks.length
    });
  } catch (error) {
    console.error('Get tasks by category error:', error);
    res.status(500).json({
      message: 'Server error fetching tasks by category'
    });
  }
};

// @desc    Get overdue tasks
// @route   GET /api/tasks/overdue
// @access  Private
const getOverdueTasks = async (req, res) => {
  try {
    const tasks = await Task.findOverdue(req.user._id);

    res.json({
      tasks,
      count: tasks.length
    });
  } catch (error) {
    console.error('Get overdue tasks error:', error);
    res.status(500).json({
      message: 'Server error fetching overdue tasks'
    });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
  addSubTask,
  getTasksByCategory,
  getOverdueTasks
};
