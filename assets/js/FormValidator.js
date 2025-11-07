/**
 * FormValidator Class
 * Handles real-time form validation and error display
 */
class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.errors = {};
        this.setupEventListeners();
    }

    /**
     * Set up event listeners for form fields
     */
    setupEventListeners() {
        if (!this.form) return;

        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', (e) => this.validateField(e.target));
            input.addEventListener('input', (e) => this.clearError(e.target));
        });
    }

    /**
     * Validate a single field
     */
    validateField(field) {
        const fieldName = field.id;
        const value = field.value.trim();
        let error = null;

        switch(fieldName) {
            case 'projectName':
                error = ValidationService.validateProjectName(value);
                break;
            case 'projectDescription':
                error = ValidationService.validateProjectDescription(value);
                break;
            case 'projectDeadline':
                error = ValidationService.validateProjectDeadline(value);
                break;
            case 'projectBudget':
                error = ValidationService.validateProjectBudget(value);
                break;
            case 'taskTitle':
                error = ValidationService.validateTaskTitle(value);
                break;
            case 'taskDescription':
                error = ValidationService.validateTaskDescription(value);
                break;
            case 'taskProject':
                error = ValidationService.validateTaskProject(value);
                break;
            case 'taskHours':
                error = ValidationService.validateEstimatedHours(value);
                break;
            case 'taskDate':
                error = ValidationService.validateTaskDueDate(value);
                break;
        }

        if (error) {
            this.showError(fieldName, error);
        } else {
            this.clearError(fieldName);
        }

        return !error;
    }

    /**
     * Show error for a field
     */
    showError(fieldName, message) {
        const errorDiv = document.getElementById(fieldName + 'Error');
        const fieldGroup = document.getElementById(fieldName)?.closest('.form-group');

        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }

        if (fieldGroup) {
            fieldGroup.classList.add('error');
            fieldGroup.classList.remove('success');
        }

        this.errors[fieldName] = message;
    }

    /**
     * Clear error for a field
     */
    clearError(fieldName) {
        if (typeof fieldName === 'object') {
            fieldName = fieldName.id;
        }

        const errorDiv = document.getElementById(fieldName + 'Error');
        const fieldGroup = document.getElementById(fieldName)?.closest('.form-group');

        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
        }

        if (fieldGroup) {
            fieldGroup.classList.remove('error');
            fieldGroup.classList.add('success');
        }

        delete this.errors[fieldName];
    }

    /**
     * Validate entire form
     */
    validateForm() {
        const inputs = this.form.querySelectorAll('input, textarea, select');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    /**
     * Check if form has any errors
     */
    hasErrors() {
        return Object.keys(this.errors).length > 0;
    }

    /**
     * Get all errors
     */
    getErrors() {
        return this.errors;
    }
}
