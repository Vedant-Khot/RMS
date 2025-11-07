/**
 * Task View
 * Handles rendering of task-related UI components
 */
class TaskView {
    constructor() {
        this.container = null;
    }

    /**
     * Render task card
     */
    renderTaskItem(task) {
        const priorityClass = task.priority ? `priority-${task.priority}` : '';
        return `
            <div class="task-card ${priorityClass}" data-task-id="${task.id}">
                <div class="project-card-header">
                    <h3 class="project-title">${this.escapeHtml(task.title)}</h3>
                    <span class="status-badge ${task.status}">${task.status}</span>
                </div>
                <p class="project-description">${this.escapeHtml(task.description || 'No description provided')}</p>
                <div class="project-meta">
                    <div class="meta-item">
                        <i class="fas fa-project-diagram"></i>
                        <span>Project: ${this.getProjectName(task.projectId)}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-user"></i>
                        <span>Assigned: ${task.assignedTo || 'Unassigned'}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${task.estimatedHours || 0}h estimated</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>Due: ${this.formatDate(task.dueDate)}</span>
                    </div>
                </div>
                <div class="project-actions">
                    <button class="btn btn-primary btn-sm" onclick="this.viewTask('${task.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="this.editTask('${task.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render task list
     */
    renderTaskList(tasks) {
        if (!tasks || tasks.length === 0) {
            return this.renderEmptyState('No tasks found', 'Create your first task to get started.');
        }

        return tasks.map(task => this.renderTaskItem(task)).join('');
    }

    /**
     * Render empty state
     */
    renderEmptyState(title, message) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-tasks"></i>
                </div>
                <h3>${title}</h3>
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * Get project name by ID
     */
    getProjectName(projectId) {
        return 'Project Name'; // Placeholder
    }

    /**
     * Format date for display
     */
    formatDate(dateString) {
        if (!dateString) return 'No due date';
        return new Date(dateString).toLocaleDateString();
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
