import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  getCategoryColor, 
  getCategoryIcon, 
  getPriorityColor, 
  getPriorityIcon,
  formatRelativeTime,
  isOverdue,
  getDaysUntilDue
} from '../utils/helpers';
import Button from './Button';

const TaskCard = ({ 
  task, 
  onToggle, 
  onEdit, 
  onDelete, 
  isSelected = false, 
  onSelect 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const categoryInfo = { color: getCategoryColor(task.category), icon: getCategoryIcon(task.category) };
  const priorityInfo = { color: getPriorityColor(task.priority), icon: getPriorityIcon(task.priority) };
  
  const overdue = isOverdue(task.dueDate);
  const daysUntilDue = getDaysUntilDue(task.dueDate);

  const handleToggle = (e) => {
    e.stopPropagation();
    onToggle(task._id);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(task);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(task._id);
  };

  const handleSelect = () => {
    if (onSelect) {
      onSelect(task._id);
    }
  };

  return (
    <motion.div
      className={`
        task-card relative bg-white dark:bg-gray-800 rounded-xl p-4 border-2 
        transition-all duration-300 cursor-pointer group
        ${task.isDone ? 'completed opacity-75' : ''}
        ${isSelected ? 'ring-2 ring-primary-500 border-primary-300' : 'border-gray-200 dark:border-gray-700'}
        ${isHovered ? 'shadow-card-hover' : 'shadow-card'}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleSelect}
      layout
    >
      {/* Priority indicator */}
      <div 
        className={`absolute top-0 left-0 w-full h-1 rounded-t-xl bg-${priorityInfo.color}-500`}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Checkbox */}
          <motion.button
            className={`
              custom-checkbox mt-1 flex-shrink-0
              ${task.isDone ? 'bg-green-500 border-green-500' : ''}
            `}
            onClick={handleToggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 
                className={`
                  task-title font-semibold text-gray-900 dark:text-white truncate
                  ${task.isDone ? 'line-through' : ''}
                `}
              >
                {task.title}
              </h3>
              
              {/* Category badge */}
              <span className={`category-badge category-${task.category} flex-shrink-0`}>
                <span className="mr-1">{categoryInfo.icon}</span>
                {task.category}
              </span>
            </div>

            {/* Description */}
            {task.description && (
              <p 
                className={`
                  text-sm text-gray-600 dark:text-gray-400 mb-2
                  ${isExpanded ? '' : 'line-clamp-2'}
                `}
              >
                {task.description}
              </p>
            )}

            {/* Due date */}
            {task.dueDate && (
              <div className="flex items-center gap-1 mb-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span 
                  className={`
                    text-xs
                    ${overdue && !task.isDone ? 'text-red-600 font-semibold' : 'text-gray-500'}
                  `}
                >
                  {overdue && !task.isDone ? 'Overdue' : ''}
                  {daysUntilDue !== null && daysUntilDue >= 0 && !task.isDone ? 
                    (daysUntilDue === 0 ? 'Due today' : `${daysUntilDue} days left`) : 
                    formatRelativeTime(task.dueDate)
                  }
                </span>
              </div>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {task.tags.slice(0, isExpanded ? task.tags.length : 3).map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
                {!isExpanded && task.tags.length > 3 && (
                  <span className="text-xs text-gray-400">+{task.tags.length - 3} more</span>
                )}
              </div>
            )}

            {/* Subtasks progress */}
            {task.subTasks && task.subTasks.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${task.subTasks.filter(st => st.isDone).length / task.subTasks.length * 100}%` 
                      }}
                    />
                  </div>
                  <span>
                    {task.subTasks.filter(st => st.isDone).length}/{task.subTasks.length}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Priority and actions */}
        <div className="flex flex-col items-end gap-2">
          {/* Priority badge */}
          <span className={`priority-${task.priority} px-2 py-1 rounded-full text-xs font-medium`}>
            {priorityInfo.icon} {task.priority}
          </span>

          {/* Actions */}
          <div className={`flex gap-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleEdit}
              className="p-1 h-8 w-8"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              className="p-1 h-8 w-8 text-red-500 hover:text-red-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && task.subTasks && task.subTasks.length > 0 && (
        <motion.div
          className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subtasks ({task.subTasks.filter(st => st.isDone).length}/{task.subTasks.length})
          </h4>
          <div className="space-y-1">
            {task.subTasks.map((subtask, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={subtask.isDone}
                  className="custom-checkbox"
                  readOnly
                />
                <span 
                  className={`text-sm ${
                    subtask.isDone 
                      ? 'line-through text-gray-500' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {subtask.title}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Expand button */}
      {(task.description?.length > 100 || (task.subTasks && task.subTasks.length > 0) || (task.tags && task.tags.length > 3)) && (
        <motion.button
          className="mt-3 text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          whileHover={{ scale: 1.02 }}
        >
          {isExpanded ? 'Show less' : 'Show more'}
          <svg 
            className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </motion.button>
      )}

      {/* Footer metadata */}
      <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-400">
        <span>Created {formatRelativeTime(task.createdAt)}</span>
        {task.updatedAt !== task.createdAt && (
          <span>Updated {formatRelativeTime(task.updatedAt)}</span>
        )}
      </div>
    </motion.div>
  );
};

export default TaskCard;
