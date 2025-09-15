const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    minlength: [1, 'Title cannot be empty'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: ''
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['work', 'personal', 'health', 'finance', 'shopping', 'education', 'other'],
      message: 'Category must be one of: work, personal, health, finance, shopping, education, other'
    },
    default: 'personal'
  },
  isDone: {
    type: Boolean,
    default: false,
    index: true
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: 'Priority must be one of: low, medium, high, urgent'
    },
    default: 'medium'
  },
  dueDate: {
    type: Date,
    default: null,
    validate: {
      validator: function(value) {
        return !value || value > new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  completedAt: {
    type: Date,
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  subTasks: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Subtask title cannot exceed 100 characters']
    },
    isDone: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Compound indexes for performance
taskSchema.index({ userId: 1, isDone: 1 });
taskSchema.index({ userId: 1, category: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });

// Pre-save middleware to set completedAt when task is marked as done
taskSchema.pre('save', function(next) {
  if (this.isModified('isDone')) {
    if (this.isDone && !this.completedAt) {
      this.completedAt = new Date();
    } else if (!this.isDone) {
      this.completedAt = null;
    }
  }
  next();
});

// Virtual for completion percentage of subtasks
taskSchema.virtual('completionPercentage').get(function() {
  if (this.subTasks.length === 0) return 0;
  const completedSubTasks = this.subTasks.filter(subTask => subTask.isDone).length;
  return Math.round((completedSubTasks / this.subTasks.length) * 100);
});

// Instance method to toggle task completion
taskSchema.methods.toggleCompletion = function() {
  this.isDone = !this.isDone;
  return this.save();
};

// Instance method to add subtask
taskSchema.methods.addSubTask = function(title) {
  this.subTasks.push({ title });
  return this.save();
};

// Static method to get tasks by category
taskSchema.statics.findByCategory = function(userId, category) {
  return this.find({ userId, category }).sort({ createdAt: -1 });
};

// Static method to get overdue tasks
taskSchema.statics.findOverdue = function(userId) {
  return this.find({
    userId,
    isDone: false,
    dueDate: { $lt: new Date() }
  }).sort({ dueDate: 1 });
};

// Static method to get tasks by priority
taskSchema.statics.findByPriority = function(userId, priority) {
  return this.find({ userId, priority, isDone: false }).sort({ createdAt: -1 });
};

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
