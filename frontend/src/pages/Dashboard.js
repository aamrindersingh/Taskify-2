import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../services/api';
import { 
  filterTasks, 
  sortTasks, 
  getTaskStats, 
  debounce 
} from '../utils/helpers';
import { 
  TASK_CATEGORIES, 
  TASK_PRIORITIES, 
  SORT_OPTIONS, 
  ANIMATION_VARIANTS,
  SUCCESS_MESSAGES 
} from '../utils/constants';
import toast from 'react-hot-toast';

// Components
import TaskCard from '../components/TaskCard';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  // Filters and search
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    priority: 'all',
    status: 'all'
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // New task form
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'personal',
    priority: 'medium',
    dueDate: '',
    tags: []
  });

  // Load tasks
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getTasks();
      setTasks(response.tasks || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((searchTerm) => {
      setFilters(prev => ({ ...prev, search: searchTerm }));
    }, 300),
    []
  );

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    const filtered = filterTasks(tasks, filters);
    return sortTasks(filtered, sortBy, sortOrder);
  }, [tasks, filters, sortBy, sortOrder]);

  // Get task statistics
  const stats = useMemo(() => getTaskStats(tasks), [tasks]);

  // Handle task actions
  const handleToggleTask = async (taskId) => {
    try {
      const response = await tasksAPI.toggleTask(taskId);
      setTasks(prev => prev.map(task => 
        task._id === taskId ? response.task : task
      ));
      toast.success(response.message);
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await tasksAPI.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task._id !== taskId));
      toast.success(SUCCESS_MESSAGES.TASK_DELETED);
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    if (!newTask.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      const response = await tasksAPI.createTask({
        ...newTask,
        tags: newTask.tags.filter(tag => tag.trim())
      });
      setTasks(prev => [response.task, ...prev]);
      setNewTask({
        title: '',
        description: '',
        category: 'personal',
        priority: 'medium',
        dueDate: '',
        tags: []
      });
      setShowCreateModal(false);
      toast.success(SUCCESS_MESSAGES.TASK_CREATED);
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description || '',
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      tags: task.tags || []
    });
    setShowCreateModal(true);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    
    if (!newTask.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      const response = await tasksAPI.updateTask(editingTask._id, {
        ...newTask,
        tags: newTask.tags.filter(tag => tag.trim())
      });
      setTasks(prev => prev.map(task => 
        task._id === editingTask._id ? response.task : task
      ));
      setEditingTask(null);
      setNewTask({
        title: '',
        description: '',
        category: 'personal',
        priority: 'medium',
        dueDate: '',
        tags: []
      });
      setShowCreateModal(false);
      toast.success(SUCCESS_MESSAGES.TASK_UPDATED);
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return;
    
    if (!window.confirm(`Delete ${selectedTasks.length} selected tasks?`)) return;

    try {
      await Promise.all(selectedTasks.map(id => tasksAPI.deleteTask(id)));
      setTasks(prev => prev.filter(task => !selectedTasks.includes(task._id)));
      setSelectedTasks([]);
      toast.success(`${selectedTasks.length} tasks deleted`);
    } catch (error) {
      toast.error('Failed to delete tasks');
    }
  };

  const handleSelectTask = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your tasks..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <motion.header 
        className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
        {...ANIMATION_VARIANTS.slideIn}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <motion.div
                className="h-10 w-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center"
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <span className="text-white text-lg">📝</span>
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Taskify</h1>
                <p className="text-sm text-gray-500">Welcome back, {user?.name}!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowCreateModal(true)}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                New Task
              </Button>
              
              <Button variant="ghost" onClick={logout}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          {...ANIMATION_VARIANTS.stagger}
        >
          {[
            { label: 'Total Tasks', value: stats.total, color: 'blue', icon: '📋' },
            { label: 'Completed', value: stats.completed, color: 'green', icon: '✅' },
            { label: 'Pending', value: stats.pending, color: 'yellow', icon: '⏳' },
            { label: 'Overdue', value: stats.overdue, color: 'red', icon: '🚨' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card"
              {...ANIMATION_VARIANTS.slideIn}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2, shadow: '0 10px 25px rgba(0,0,0,0.1)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className="text-2xl">{stat.icon}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters and Search */}
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card mb-8"
          {...ANIMATION_VARIANTS.slideIn}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Input
              placeholder="Search tasks..."
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              onChange={(e) => debouncedSearch(e.target.value)}
            />
            
            <select
              className="form-select w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="all">All Categories</option>
              {TASK_CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>
            
            <select
              className="form-select w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            >
              <option value="all">All Priorities</option>
              {TASK_PRIORITIES.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.icon} {priority.label}
                </option>
              ))}
            </select>
            
            <select
              className="form-select w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <select
                className="form-select px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    Sort by {option.label}
                  </option>
                ))}
              </select>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'} {sortOrder.toUpperCase()}
              </Button>
            </div>
            
            {selectedTasks.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{selectedTasks.length} selected</span>
                <Button variant="danger" size="sm" onClick={handleBulkDelete}>
                  Delete Selected
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tasks Grid */}
        <motion.div {...ANIMATION_VARIANTS.stagger}>
          {filteredAndSortedTasks.length === 0 ? (
            <motion.div 
              className="text-center py-12"
              {...ANIMATION_VARIANTS.fadeIn}
            >
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {tasks.length === 0 ? 'No tasks yet' : 'No tasks match your filters'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {tasks.length === 0 
                  ? 'Create your first task to get started!' 
                  : 'Try adjusting your search or filters.'}
              </p>
              {tasks.length === 0 && (
                <Button onClick={() => setShowCreateModal(true)}>
                  Create Your First Task
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredAndSortedTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    isSelected={selectedTasks.includes(task._id)}
                    onSelect={handleSelectTask}
                    onToggle={handleToggleTask}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* Create/Edit Task Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowCreateModal(false);
              setEditingTask(null);
            }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h2>
              
              <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask} className="space-y-4">
                <Input
                  label="Title"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title..."
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"
                    rows="3"
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter task description..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      className="form-select w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      value={newTask.category}
                      onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))}
                    >
                      {TASK_CATEGORIES.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.icon} {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Priority
                    </label>
                    <select
                      className="form-select w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      value={newTask.priority}
                      onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      {TASK_PRIORITIES.map(priority => (
                        <option key={priority.value} value={priority.value}>
                          {priority.icon} {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <Input
                  label="Due Date"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                />
                
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    fullWidth
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingTask(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" fullWidth>
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
