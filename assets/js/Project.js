/**
 * Project Model
 * Represents a project in the RMS system
 */
class Project {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.name = data.name || '';
        this.description = data.description || '';
        this.status = data.status || 'planning'; // planning, in-progress, review, completed
        this.priority = data.priority || 'medium'; // low, medium, high, urgent
        this.startDate = data.startDate || null;
        this.deadline = data.deadline || null;
        this.completedAt = data.completedAt || null;
        this.progress = data.progress || 0; // 0-100
        this.budget = data.budget || null;
        this.leaderId = data.leaderId || null;
        this.memberIds = data.memberIds || [];
        this.tags = data.tags || [];
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.metadata = data.metadata || {};
    }

    /**
     * Generate a unique ID for the project
     */
    generateId() {
        return 'project_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Add a member to the project
     */
    addMember(memberId) {
        if (!this.memberIds.includes(memberId)) {
            this.memberIds.push(memberId);
            this.updatedAt = new Date().toISOString();
        }
    }

    /**
     * Remove a member from the project
     */
    removeMember(memberId) {
        const index = this.memberIds.indexOf(memberId);
        if (index > -1) {
            this.memberIds.splice(index, 1);
            this.updatedAt = new Date().toISOString();
        }
    }

    /**
     * Check if a user is a member of this project
     */
    hasMember(memberId) {
        return this.memberIds.includes(memberId);
    }

    /**
     * Set project leader
     */
    setLeader(leaderId) {
        this.leaderId = leaderId;
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Update project status
     */
    updateStatus(status) {
        const validStatuses = ['planning', 'in-progress', 'review', 'completed', 'cancelled'];
        if (validStatuses.includes(status)) {
            this.status = status;
            if (status === 'completed') {
                this.completedAt = new Date().toISOString();
                this.progress = 100;
            }
            this.updatedAt = new Date().toISOString();
        }
    }

    /**
     * Update project progress
     */
    updateProgress(progress) {
        if (progress >= 0 && progress <= 100) {
            this.progress = progress;
            if (progress === 100) {
                this.status = 'completed';
                this.completedAt = new Date().toISOString();
            }
            this.updatedAt = new Date().toISOString();
        }
    }

    /**
     * Check if project is overdue
     */
    isOverdue() {
        if (!this.deadline || this.status === 'completed') {
            return false;
        }
        return new Date(this.deadline) < new Date();
    }

    /**
     * Get days until deadline
     */
    getDaysUntilDeadline() {
        if (!this.deadline) return null;

        const today = new Date();
        const deadline = new Date(this.deadline);
        const diffTime = deadline - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    }

    /**
     * Get project duration in days
     */
    getDuration() {
        if (!this.startDate) return null;

        const start = new Date(this.startDate);
        const end = this.completedAt ? new Date(this.completedAt) : new Date();
        const diffTime = end - start;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Get status badge color
     */
    getStatusColor() {
        const colors = {
            'planning': 'warning',
            'in-progress': 'info',
            'review': 'secondary',
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
     * Validate project data
     */
    validate() {
        const errors = [];

        if (!this.name || this.name.trim().length < 3) {
            errors.push('Project name must be at least 3 characters long');
        }

        if (!this.description || this.description.trim().length < 10) {
            errors.push('Project description must be at least 10 characters long');
        }

        if (this.deadline && new Date(this.deadline) <= new Date()) {
            errors.push('Project deadline must be in the future');
        }

        if (this.memberIds.length === 0) {
            errors.push('Project must have at least one member');
        }

        if (!this.leaderId) {
            errors.push('Project must have a leader');
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
            name: this.name,
            description: this.description,
            status: this.status,
            priority: this.priority,
            startDate: this.startDate,
            deadline: this.deadline,
            completedAt: this.completedAt,
            progress: this.progress,
            budget: this.budget,
            leaderId: this.leaderId,
            memberIds: this.memberIds,
            tags: this.tags,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            metadata: this.metadata
        };
    }

    /**
     * Create Project instance from plain object
     */
    static fromJSON(data) {
        return new Project(data);
    }
}
