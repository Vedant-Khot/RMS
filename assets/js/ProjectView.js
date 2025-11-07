/**
 * Project View
 * Handles rendering of project-related UI components
 */
class ProjectView {
    constructor() {
        this.container = null;
    }

    /**
     * Render project card
     */
    renderProjectCard(project) {
        return `
            <div class="project-card" data-project-id="${project.id}">
                <div class="project-card-header">
                    <h3 class="project-title">${this.escapeHtml(project.name)}</h3>
                    <span class="status-badge ${project.status}">${project.status}</span>
                </div>
                <p class="project-description">${this.escapeHtml(project.description)}</p>
                <div class="project-meta">
                    <div class="meta-item">
                        <i class="fas fa-user-tie"></i>
                        <span>Leader: ${this.getLeaderName(project.leaderId)}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-users"></i>
                        <span>Members: ${project.memberIds.length}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>Due: ${this.formatDate(project.deadline)}</span>
                    </div>
                </div>
                <div class="project-actions">
                    <button class="btn btn-primary btn-sm" onclick="this.viewProject('${project.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="this.editProject('${project.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render project list
     */
    renderProjectList(projects) {
        if (!projects || projects.length === 0) {
            return this.renderEmptyState('No projects found', 'Create your first project to get started.');
        }

        return projects.map(project => this.renderProjectCard(project)).join('');
    }

    /**
     * Render empty state
     */
    renderEmptyState(title, message) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-project-diagram"></i>
                </div>
                <h3>${title}</h3>
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * Render project form
     */
    renderProjectForm(project = null) {
        const isEditing = project !== null;

        return `
            <form class="modal-form" id="projectForm">
                <div class="form-group">
                    <label class="form-label" for="projectName">Project Name</label>
                    <input type="text" class="form-input" id="projectName" value="${isEditing ? project.name : ''}" required>
                    <div class="form-error" id="projectNameError"></div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="projectDescription">Description</label>
                    <textarea class="form-textarea" id="projectDescription" rows="4" required>${isEditing ? project.description : ''}</textarea>
                    <div class="form-error" id="projectDescriptionError"></div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="projectDeadline">Deadline</label>
                        <input type="date" class="form-input" id="projectDeadline" value="${isEditing ? project.deadline : ''}" required>
                        <div class="form-error" id="projectDeadlineError"></div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="projectStatus">Status</label>
                        <select class="form-select" id="projectStatus">
                            <option value="planning" ${isEditing && project.status === 'planning' ? 'selected' : ''}>Planning</option>
                            <option value="in-progress" ${isEditing && project.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                            <option value="review" ${isEditing && project.status === 'review' ? 'selected' : ''}>Review</option>
                            <option value="completed" ${isEditing && project.status === 'completed' ? 'selected' : ''}>Completed</option>
                        </select>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="this.closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">${isEditing ? 'Update' : 'Create'} Project</button>
                </div>
            </form>
        `;
    }

    /**
     * Get leader name by ID
     */
    getLeaderName(leaderId) {
        // This would typically get the user from the app state
        return 'Project Leader'; // Placeholder
    }

    /**
     * Format date for display
     */
    formatDate(dateString) {
        if (!dateString) return 'No deadline';
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
