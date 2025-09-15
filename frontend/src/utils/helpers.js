import { TASK_CATEGORIES, TASK_PRIORITIES } from './constants';

// Format date utilities
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return dateObj.toLocaleDateString('en-US', defaultOptions);
};

export const formatDateTime = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const dateObj = new Date(date);
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 30) {
    return `${diffInDays}d ago`;
  } else {
    return formatDate(date);
  }
};

export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

export const getDaysUntilDue = (dueDate) => {
  if (!dueDate) return null;
  
  const now = new Date();
  const due = new Date(dueDate);
  const diffInMs = due.getTime() - now.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  
  return diffInDays;
};

// Category utilities
export const getCategoryInfo = (category) => {
  return TASK_CATEGORIES.find(cat => cat.value === category) || TASK_CATEGORIES[6]; // default to 'other'
};

export const getCategoryColor = (category) => {
  const categoryInfo = getCategoryInfo(category);
  return categoryInfo.color;
};

export const getCategoryIcon = (category) => {
  const categoryInfo = getCategoryInfo(category);
  return categoryInfo.icon;
};

// Priority utilities
export const getPriorityInfo = (priority) => {
  return TASK_PRIORITIES.find(p => p.value === priority) || TASK_PRIORITIES[1]; // default to 'medium'
};

export const getPriorityColor = (priority) => {
  const priorityInfo = getPriorityInfo(priority);
  return priorityInfo.color;
};

export const getPriorityIcon = (priority) => {
  const priorityInfo = getPriorityInfo(priority);
  return priorityInfo.icon;
};

// Sort priority values for comparison
export const getPriorityValue = (priority) => {
  const priorities = { low: 1, medium: 2, high: 3, urgent: 4 };
  return priorities[priority] || 2;
};

// Task utilities
export const getTaskStats = (tasks) => {
  const total = tasks.length;
  const completed = tasks.filter(task => task.isDone).length;
  const pending = total - completed;
  const overdue = tasks.filter(task => !task.isDone && isOverdue(task.dueDate)).length;
  
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return {
    total,
    completed,
    pending,
    overdue,
    completionRate
  };
};

export const groupTasksByCategory = (tasks) => {
  return tasks.reduce((groups, task) => {
    const category = task.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(task);
    return groups;
  }, {});
};

export const groupTasksByPriority = (tasks) => {
  return tasks.reduce((groups, task) => {
    const priority = task.priority || 'medium';
    if (!groups[priority]) {
      groups[priority] = [];
    }
    groups[priority].push(task);
    return groups;
  }, {});
};

export const sortTasks = (tasks, sortBy, sortOrder = 'desc') => {
  const sortedTasks = [...tasks].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Handle special cases
    if (sortBy === 'priority') {
      aValue = getPriorityValue(a.priority);
      bValue = getPriorityValue(b.priority);
    } else if (sortBy === 'title') {
      aValue = aValue?.toLowerCase() || '';
      bValue = bValue?.toLowerCase() || '';
    } else if (sortBy === 'dueDate') {
      aValue = aValue ? new Date(aValue) : new Date('9999-12-31');
      bValue = bValue ? new Date(bValue) : new Date('9999-12-31');
    } else if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  
  return sortedTasks;
};

export const filterTasks = (tasks, filters) => {
  return tasks.filter(task => {
    // Status filter
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'pending' && task.isDone) return false;
      if (filters.status === 'completed' && !task.isDone) return false;
    }
    
    // Category filter
    if (filters.category && filters.category !== 'all') {
      if (task.category !== filters.category) return false;
    }
    
    // Priority filter
    if (filters.priority && filters.priority !== 'all') {
      if (task.priority !== filters.priority) return false;
    }
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const title = task.title?.toLowerCase() || '';
      const description = task.description?.toLowerCase() || '';
      const tags = task.tags?.join(' ').toLowerCase() || '';
      
      if (!title.includes(searchTerm) && 
          !description.includes(searchTerm) && 
          !tags.includes(searchTerm)) {
        return false;
      }
    }
    
    return true;
  });
};

// Validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateTaskTitle = (title) => {
  return title && title.trim().length > 0 && title.length <= 200;
};

// Local storage utilities
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
  }
};

// URL utilities
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });
  
  return searchParams.toString();
};

// Debounce utility
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Theme utilities
export const getSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const applyTheme = (theme) => {
  const root = document.documentElement;
  const actualTheme = theme === 'auto' ? getSystemTheme() : theme;
  
  if (actualTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

// File size formatter
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

export default {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  isOverdue,
  getDaysUntilDue,
  getCategoryInfo,
  getCategoryColor,
  getCategoryIcon,
  getPriorityInfo,
  getPriorityColor,
  getPriorityIcon,
  getPriorityValue,
  getTaskStats,
  groupTasksByCategory,
  groupTasksByPriority,
  sortTasks,
  filterTasks,
  validateEmail,
  validatePassword,
  validateTaskTitle,
  getFromStorage,
  setToStorage,
  removeFromStorage,
  buildQueryString,
  debounce,
  getSystemTheme,
  applyTheme,
  generateId,
  copyToClipboard,
  formatFileSize,
  truncateText
};
