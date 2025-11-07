/**
 * Application Constants
 * Centralized configuration and constants
 */

// API Configuration
const API = {
    BASE_URL: '',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3
};

// UI Configuration
const UI = {
    NOTIFICATION_DURATION: 5000,
    MODAL_ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 300,
    THROTTLE_LIMIT: 100
};

// Status Options
const STATUSES = {
    PROJECT: [
        { value: 'planning', label: 'Planning', color: 'warning' },
        { value: 'in-progress', label: 'In Progress', color: 'info' },
        { value: 'review', label: 'Review', color: 'secondary' },
        { value: 'completed', label: 'Completed', color: 'success' },
        { value: 'cancelled', label: 'Cancelled', color: 'danger' }
    ],
    TASK: [
        { value: 'todo', label: 'To Do', color: 'secondary' },
        { value: 'in-progress', label: 'In Progress', color: 'info' },
        { value: 'review', label: 'Review', color: 'warning' },
        { value: 'completed', label: 'Completed', color: 'success' },
        { value: 'cancelled', label: 'Cancelled', color: 'danger' }
    ]
};

// Priority Options
const PRIORITIES = [
    { value: 'low', label: 'Low', color: 'success' },
    { value: 'medium', label: 'Medium', color: 'warning' },
    { value: 'high', label: 'High', color: 'danger' },
    { value: 'urgent', label: 'Urgent', color: 'danger' }
];

// Role Options
const ROLES = [
    { value: 'admin', label: 'Administrator', color: 'danger' },
    { value: 'manager', label: 'Manager', color: 'warning' },
    { value: 'member', label: 'Member', color: 'info' },
    { value: 'viewer', label: 'Viewer', color: 'secondary' }
];

// Project Role Options
const PROJECT_ROLES = [
    { value: 'leader', label: 'Project Leader', color: 'primary' },
    { value: 'editor', label: 'Editor', color: 'info' },
    { value: 'designer', label: 'Designer', color: 'success' },
    { value: 'viewer', label: 'Viewer', color: 'secondary' }
];

// Permissions
const PERMISSIONS = {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
    MANAGE_MEMBERS: 'manage_members',
    MANAGE_TASKS: 'manage_tasks',
    MANAGE_SETTINGS: 'manage_settings'
};

// File Upload Configuration
const UPLOAD = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    MAX_FILES: 5
};

// Date Format Options
const DATE_FORMATS = {
    SHORT: { month: 'short', day: 'numeric' },
    MEDIUM: { year: 'numeric', month: 'short', day: 'numeric' },
    LONG: { year: 'numeric', month: 'long', day: 'numeric' },
    WITH_TIME: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }
};

// Color Scheme
const COLORS = {
    PRIMARY: '#6366f1',
    SECONDARY: '#64748b',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    DANGER: '#ef4444',
    INFO: '#3b82f6',
    LIGHT: '#f8fafc',
    DARK: '#1e293b'
};

// Breakpoints for responsive design
const BREAKPOINTS = {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536
};

// Local Storage Keys
const STORAGE_KEYS = {
    APP_DATA: 'rms_data',
    USER_PREFERENCES: 'rms_preferences',
    THEME: 'rms_theme',
    LANGUAGE: 'rms_language'
};

// Available Theme Colors (7 Rainbow Colors)
const THEME_COLORS = [
    { value: 'red', label: 'Red', primary: '--color-danger-500' },
    { value: 'orange', label: 'Orange', primary: '--color-orange-500' },
    { value: 'yellow', label: 'Yellow', primary: '--color-warning-500' },
    { value: 'green', label: 'Green', primary: '--color-success-500' },
    { value: 'blue', label: 'Blue', primary: '--color-primary-500' },
    { value: 'indigo', label: 'Indigo', primary: '--color-indigo-500' },
    { value: 'violet', label: 'Violet', primary: '--color-purple-500' }
];

// Default Settings
const DEFAULT_SETTINGS = {
    theme: 'light',
    color: 'blue',
    language: 'en',
    notifications: true,
    autoSave: true,
    itemsPerPage: 10,
    dateFormat: 'medium',
    timeFormat: '12h'
};

// Validation Rules
const VALIDATION = {
    PASSWORD_MIN_LENGTH: 8,
    NAME_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 1000,
    PROJECT_NAME_MIN_LENGTH: 3,
    TASK_TITLE_MIN_LENGTH: 3
};

// Error Messages
const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    PERMISSION_DENIED: 'You do not have permission to perform this action.',
    FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
    INVALID_FILE_TYPE: 'File type is not supported.',
    SAVE_FAILED: 'Failed to save data. Please try again.',
    LOAD_FAILED: 'Failed to load data. Please refresh the page.'
};

// Success Messages
const SUCCESS_MESSAGES = {
    PROJECT_CREATED: 'Project created successfully!',
    PROJECT_UPDATED: 'Project updated successfully!',
    TASK_CREATED: 'Task created successfully!',
    TASK_UPDATED: 'Task updated successfully!',
    DATA_SAVED: 'Data saved successfully!',
    SETTINGS_UPDATED: 'Settings updated successfully!'
};

// Animation Durations
const ANIMATIONS = {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
};

// Icons
const ICONS = {
    PROJECT: 'fas fa-project-diagram',
    TASK: 'fas fa-tasks',
    USER: 'fas fa-user',
    MEMBER: 'fas fa-users',
    ANALYTICS: 'fas fa-chart-bar',
    SETTINGS: 'fas fa-cog',
    NOTIFICATION: 'fas fa-bell',
    SEARCH: 'fas fa-search',
    EDIT: 'fas fa-edit',
    DELETE: 'fas fa-trash',
    ADD: 'fas fa-plus',
    SAVE: 'fas fa-save',
    CANCEL: 'fas fa-times',
    SUCCESS: 'fas fa-check-circle',
    ERROR: 'fas fa-times-circle',
    WARNING: 'fas fa-exclamation-triangle',
    INFO: 'fas fa-info-circle'
};
