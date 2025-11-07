/**
 * Task Model
 * Represents a task in the RMS system
 */
class Task {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.projectId = data.projectId || null;
        this.assignedTo = data.assignedTo || null; // user ID
        this.title = data.title || '';
        this.description = data.description || '';
        this.status = data.status || 'todo'; // todo, in-progress, review, completed
        this.priority = data.priority || 'medium'; // low, medium, high, urgent
        this.category = data.category || 'general'; // general, development, design, testing, documentation
        this.estimatedHours = data.estimatedHours || null;
        this.actualHours = data.actualHours || 0;
        this.startDate = data.startDate || null;
        this.dueDate = data.dueDate || null;
        this.completedAt = data.completedAt || null;
        this.tags = data.tags || [];
        this.attachments = data.attachments || [];
        this.comments = data.comments || [];
        this.dependencies = data.dependencies || []; // array of task IDs
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.createdBy = data.createdBy || null;
        this.metadata = data.metadata || {};
    }

    /**
     * Generate a unique ID for the task
     */
    generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Update task status
     */
    updateStatus(status) {
        const validStatuses = ['todo', 'in-progress', 'review', 'completed', 'cancelled'];
        if (validStatuses.includes(status)) {
            this.status = status;
            if (status === 'completed') {
                this.completedAt = new Date().toISOString();
            }
            this.updatedAt = new Date().toISOString();
        }
    }

    /**
     * Add time to the task
     */
    addTime(hours) {
        if (hours > 0) {
            this.actualHours += hours;
            this.updatedAt = new Date().toISOString();
        }
    }

    /**
     * Check if task is overdue
     */
    isOverdue() {
        if (!this.dueDate || this.status === 'completed' || this.status === 'cancelled') {
            return false;
        }
        return new Date(this.dueDate) < new Date();
    }

    /**
     * Get days until due date
     */
    getDaysUntilDue() {
        if (!this.dueDate) return null;

        const today = new Date();
        const dueDate = new Date(this.dueDate);
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    }

    /**
     * Get time difference between estimated and actual hours
     */
    getTimeVariance() {
        if (!this.estimatedHours) return null;
        return this.actualHours - this.estimatedHours;
    }

    /**
     * Check if task has all dependencies completed
     */
    areDependenciesCompleted(allTasks = []) {
        if (this.dependencies.length === 0) return true;

        return this.dependencies.every(depId => {
            const depTask = allTasks.find(task => task.id === depId);
            return depTask && depTask.status === 'completed';
        });
    }

    /**
     * Add a comment to the task
     */
    addComment(comment, userId) {
        const newComment = {
            id: 'comment_' + Date.now(),
            text: comment,
            authorId: userId,
            createdAt: new Date().toISOString()
        };

        this.comments.push(newComment);
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Add an attachment to the task
     */
    addAttachment(attachment) {
        const newAttachment = {
            id: 'attachment_' + Date.now(),
            name: attachment.name,
            url: attachment.url,
            type: attachment.type,
            size: attachment.size,
            uploadedBy: attachment.uploadedBy,
            uploadedAt: new Date().toISOString()
        };

        this.attachments.push(newAttachment);
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Get status badge color
     */
    getStatusColor() {
        const colors = {
            'todo': 'gray',
            'in-progress': 'info',
            'review': 'warning',
            'completed': 'success',
            'cancelled': 'danger'
        };
        return colors[this.status] || 'gray';
    }

    /**
     * Get priority color
     */
    getPriorityColor() {
        const colors = {
            'low': 'success',
            'medium': 'warning',
            'high': 'danger',
            'urgent': 'danger'
        };
        return colors[this.priority] || 'gray';
    }

    /**
     * Validate task data
     */
    validate() {
        const errors = [];

        if (!this.title || this.title.trim().length < 3) {
            errors.push('Task title must be at least 3 characters long');
        }

        if (!this.projectId) {
            errors.push('Task must be assigned to a project');
        }

        if (this.estimatedHours !== null && this.estimatedHours <= 0) {
            errors.push('Estimated hours must be greater than 0');
        }

        if (this.dueDate && new Date(this.dueDate) <= new Date()) {
            errors.push('Due date must be in the future');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Convert to plain object for storage
     */
    toJSON() {
        return {
            id: this.id,
            projectId: this.projectId,
            assignedTo: this.assignedTo,
            title: this.title,
            description: this.description,
            status: this.status,
            priority: this.priority,
            category: this.category,
            estimatedHours: this.estimatedHours,
            actualHours: this.actualHours,
            startDate: this.startDate,
            dueDate: this.dueDate,
            completedAt: this.completedAt,
            tags: this.tags,
            attachments: this.attachments,
            comments: this.comments,
            dependencies: this.dependencies,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            createdBy: this.createdBy,
            metadata: this.metadata
        };
    }

    /**
     * Create Task instance from plain object
     */
    static fromJSON(data) {
        return new Task(data);
    }
}
