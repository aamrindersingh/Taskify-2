// Task categories
export const TASK_CATEGORIES = [
  { value: 'work', label: 'Work', icon: '💼', color: 'blue' },
  { value: 'personal', label: 'Personal', icon: '👤', color: 'purple' },
  { value: 'health', label: 'Health', icon: '🏥', color: 'green' },
  { value: 'finance', label: 'Finance', icon: '💰', color: 'yellow' },
  { value: 'shopping', label: 'Shopping', icon: '🛒', color: 'pink' },
  { value: 'education', label: 'Education', icon: '📚', color: 'lime' },
  { value: 'other', label: 'Other', icon: '📝', color: 'gray' }
];

// Task priorities
export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'green', icon: '🟢' },
  { value: 'medium', label: 'Medium', color: 'yellow', icon: '🟡' },
  { value: 'high', label: 'High', color: 'red', icon: '🔴' },
  { value: 'urgent', label: 'Urgent', color: 'pink', icon: '🚨' }
];

// Sort options
export const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date Created' },
  { value: 'updatedAt', label: 'Last Updated' },
  { value: 'title', label: 'Title' },
  { value: 'priority', label: 'Priority' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'category', label: 'Category' }
];

// Filter options
export const FILTER_OPTIONS = {
  status: [
    { value: 'all', label: 'All Tasks' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' }
  ],
  priority: [
    { value: 'all', label: 'All Priorities' },
    ...TASK_PRIORITIES
  ],
  category: [
    { value: 'all', label: 'All Categories' },
    ...TASK_CATEGORIES
  ]
};

// Theme options
export const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'auto', label: 'Auto', icon: '🌓' }
];

// Animation variants for Framer Motion
export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },
  
  slideIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  },
  
  slideInFromLeft: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
    transition: { duration: 0.3 }
  },
  
  slideInFromRight: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
    transition: { duration: 0.3 }
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { duration: 0.3 }
  },
  
  bounceIn: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 500
      }
    },
    exit: { opacity: 0, scale: 0.3 }
  },
  
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  PREFERENCES: 'preferences'
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    PROFILE: '/auth/me',
    UPDATE_PROFILE: '/auth/profile',
    VERIFY: '/auth/verify'
  },
  TASKS: {
    BASE: '/tasks',
    BY_CATEGORY: '/tasks/category',
    OVERDUE: '/tasks/overdue'
  }
};

// Default values
export const DEFAULT_VALUES = {
  TASK: {
    category: 'personal',
    priority: 'medium',
    isDone: false
  },
  USER: {
    theme: 'auto',
    defaultCategory: 'personal'
  },
  PAGINATION: {
    page: 1,
    limit: 20
  }
};

// Validation rules
export const VALIDATION_RULES = {
  NAME: {
    minLength: 2,
    maxLength: 50
  },
  EMAIL: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  PASSWORD: {
    minLength: 6,
    maxLength: 128
  },
  TASK_TITLE: {
    minLength: 1,
    maxLength: 200
  },
  TASK_DESCRIPTION: {
    maxLength: 1000
  },
  TAG: {
    maxLength: 30
  }
};

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION_RULES.PASSWORD.minLength} characters`,
  NAME_TOO_SHORT: `Name must be at least ${VALIDATION_RULES.NAME.minLength} characters`,
  TITLE_TOO_LONG: `Title cannot exceed ${VALIDATION_RULES.TASK_TITLE.maxLength} characters`,
  DESCRIPTION_TOO_LONG: `Description cannot exceed ${VALIDATION_RULES.TASK_DESCRIPTION.maxLength} characters`,
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  TASK_CREATED: 'Task created successfully! 🎉',
  TASK_UPDATED: 'Task updated successfully! ✅',
  TASK_DELETED: 'Task deleted successfully! 🗑️',
  TASK_COMPLETED: 'Task marked as completed! 🎯',
  TASK_UNCOMPLETED: 'Task marked as pending! 📝',
  PROFILE_UPDATED: 'Profile updated successfully! 👤',
  LOGIN_SUCCESS: 'Welcome back! 🎉',
  REGISTER_SUCCESS: 'Account created successfully! 🎉'
};

export default {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  SORT_OPTIONS,
  FILTER_OPTIONS,
  THEME_OPTIONS,
  ANIMATION_VARIANTS,
  STORAGE_KEYS,
  API_ENDPOINTS,
  DEFAULT_VALUES,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};
