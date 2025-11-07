/**
 * Validation Service
 * Provides form validation utilities
 */
class ValidationService {
    constructor() {
        this.rules = {};
    }

    /**
     * Validate email format
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate password strength
     */
    static isValidPassword(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }

    /**
     * Validate required field
     */
    static isNotEmpty(value) {
        return value && value.toString().trim().length > 0;
    }

    /**
     * Validate minimum length
     */
    static minLength(value, min) {
        return value && value.toString().length >= min;
    }

    /**
     * Validate maximum length
     */
    static maxLength(value, max) {
        return value && value.toString().length <= max;
    }

    /**
     * Validate numeric range
     */
    static isInRange(value, min, max) {
        const num = parseFloat(value);
        return !isNaN(num) && num >= min && num <= max;
    }

    /**
     * Validate date format
     */
    static isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    /**
     * Validate future date
     */
    static isFutureDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        return date > now;
    }

    /**
     * Validate URL format
     */
    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Sanitize HTML content
     */
    static sanitizeHtml(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }

    /**
     * Validate project data
     */
    static validateProject(data) {
        const errors = [];

        if (!this.isNotEmpty(data.name)) {
            errors.push('Project name is required');
        } else if (!this.minLength(data.name, 3)) {
            errors.push('Project name must be at least 3 characters');
        }

        if (!this.isNotEmpty(data.description)) {
            errors.push('Project description is required');
        } else if (!this.minLength(data.description, 10)) {
            errors.push('Project description must be at least 10 characters');
        }

        if (data.deadline && !this.isValidDate(data.deadline)) {
            errors.push('Invalid deadline format');
        } else if (data.deadline && !this.isFutureDate(data.deadline)) {
            errors.push('Deadline must be in the future');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate task data
     */
    static validateTask(data) {
        const errors = [];

        if (!this.isNotEmpty(data.title)) {
            errors.push('Task title is required');
        }

        if (!this.isNotEmpty(data.description)) {
            errors.push('Task description is required');
        }

        if (!this.isInRange(data.estimatedHours, 0.5, 1000)) {
            errors.push('Estimated hours must be between 0.5 and 1000');
        }

        if (data.dueDate && !this.isValidDate(data.dueDate)) {
            errors.push('Invalid due date format');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate user data
     */
    static validateUser(data) {
        const errors = [];

        if (!this.isNotEmpty(data.name)) {
            errors.push('Name is required');
        }

        if (!this.isNotEmpty(data.email)) {
            errors.push('Email is required');
        } else if (!this.isValidEmail(data.email)) {
            errors.push('Invalid email format');
        }

        if (data.password && !this.isValidPassword(data.password)) {
            errors.push('Password must be at least 8 characters with uppercase, lowercase, and number');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Field-level validation methods
    static validateProjectName(name) {
        if (!this.isNotEmpty(name)) return 'Project name is required';
        if (!this.minLength(name, 3)) return 'Project name must be at least 3 characters';
        if (!this.maxLength(name, 100)) return 'Project name must not exceed 100 characters';
        return null;
    }

    static validateProjectDescription(description) {
        if (!this.isNotEmpty(description)) return 'Project description is required';
        if (!this.minLength(description, 10)) return 'Project description must be at least 10 characters';
        if (!this.maxLength(description, 5000)) return 'Project description must not exceed 5000 characters';
        return null;
    }

    static validateProjectDeadline(deadline) {
        if (!this.isNotEmpty(deadline)) return 'Project deadline is required';
        if (!this.isValidDate(deadline)) return 'Invalid deadline format';
        if (!this.isFutureDate(deadline)) return 'Project deadline must be in the future';
        return null;
    }

    static validateTaskTitle(title) {
        if (!this.isNotEmpty(title)) return 'Task title is required';
        if (!this.minLength(title, 3)) return 'Task title must be at least 3 characters';
        if (!this.maxLength(title, 100)) return 'Task title must not exceed 100 characters';
        return null;
    }

    static validateTaskDescription(description) {
        if (description && !this.maxLength(description, 5000)) return 'Task description must not exceed 5000 characters';
        return null;
    }

    static validateTaskProject(projectId) {
        if (!this.isNotEmpty(projectId)) return 'Task must be assigned to a project';
        return null;
    }

    static validateEstimatedHours(hours) {
        if (!this.isNotEmpty(hours) || hours === '') return null; // Optional
        const num = parseFloat(hours);
        if (isNaN(num)) return 'Estimated hours must be a valid number';
        if (!this.isInRange(num, 0.5, 1000)) return 'Estimated hours must be between 0.5 and 1000';
        return null;
    }

    static validateTaskDueDate(dueDate) {
        if (!this.isNotEmpty(dueDate) || dueDate === '') return null; // Optional
        if (!this.isValidDate(dueDate)) return 'Invalid due date format';
        if (!this.isFutureDate(dueDate)) return 'Due date must be in the future';
        return null;
    }

    static validateProjectBudget(budget) {
        if (!this.isNotEmpty(budget) || budget === '') return null; // Optional
        const num = parseFloat(budget);
        if (isNaN(num)) return 'Budget must be a valid number';
        if (num < 0) return 'Budget cannot be negative';
        return null;
    }
}
