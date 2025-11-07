/**
 * Project Controller
 * Handles project-related functionality
 */
class ProjectController {
    constructor(app) {
        this.app = app;
        this.currentProject = null;
    }

    /**
     * Called when projects tab is activated
     */
    onTabActivated() {
        this.renderProjects();
    }

    /**
     * Update projects view
     */
    updateView() {
        this.renderProjects();
    }

    /**
     * Render projects dashboard
     */
    renderProjects() {
        const projects = this.app.getProjects();
        const container = document.getElementById('projectsGrid');
        const emptyState = document.getElementById('projectsEmptyState');

        if (!container) return;

        // Add enhanced stats overview
        const statHtml = this.renderProjectStats(projects);
        if (statHtml) {
            const contentBody = container.closest('.content-body');
            if (contentBody) {
                const statsDiv = contentBody.querySelector('.stats-overview') || document.createElement('div');
                statsDiv.className = 'stats-overview';
                statsDiv.innerHTML = statHtml;
                if (!contentBody.querySelector('.stats-overview')) {
                    contentBody.insertBefore(statsDiv, contentBody.firstChild);
                }
            }
        }

        if (projects.length === 0) {
            container.innerHTML = '';
            emptyState?.classList.remove('hidden');
            return;
        }

        emptyState?.classList.add('hidden');

        // Enhanced project cards with progress and activity indicators
        container.innerHTML = projects.map(project => {
            const progress = this.calculateProjectProgress(project);
            const isFeatured = project.priority === 'urgent' || project.status === 'In Progress';
            const urgentTasks = this.getUrgentTasksCount(project.id);

            return `
                <div class="project-card ${isFeatured ? 'project-card-featured' : ''}">
                    <div class="project-card-header">
                        <h3 class="project-title">${this.escapeHtml(project.name)}</h3>
                        <div class="header-badges">
                            <span class="status-badge ${project.status}">${project.status}</span>
                            ${project.priority === 'urgent' ? '<span class="priority-badge">Urgent</span>' : ''}
                            ${urgentTasks > 0 ? `<span class="urgent-badge">${urgentTasks} urgent</span>` : ''}
                        </div>
                    </div>
                    <p class="project-description">${this.escapeHtml(project.description)}</p>

                    <div class="project-progress">
                        <div class="progress-details">
                            <span class="progress-label">Progress</span>
                            <span class="progress-percentage">${progress}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}% !important;"></div>
                        </div>
                    </div>

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
                        <div class="meta-item">
                            <i class="fas fa-tasks"></i>
                            <span>Tasks: ${this.getProjectTasksCount(project.id)}</span>
                        </div>
                    </div>

                    ${project.tags && project.tags.length > 0 ? `
                        <div class="project-tags">
                            ${project.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
                        </div>
                    ` : ''}

                    <div class="project-actions">
                        <button class="btn btn-primary btn-sm" onclick="if(window.app && window.app.controllers && window.app.controllers.project) window.app.controllers.project.viewProject('${project.id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="if(window.app && window.app.controllers && window.app.controllers.project) window.app.controllers.project.editProject('${project.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="if(window.app && window.app.controllers && window.app.controllers.project) window.app.controllers.project.viewProjectTimeline('${project.id}')">
                            <i class="fas fa-history"></i> Timeline
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="if(window.app && window.app.controllers && window.app.controllers.project) window.app.controllers.project.deleteProject('${project.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * View project details
     */
    viewProject(projectId) {
        const project = this.app.getProjects().find(p => p.id === projectId);
        if (!project) return;

        // Create project details modal content
        const modalHTML = `
            <div class="project-details-modal">
                <div class="project-details-header">
                    <div class="project-info">
                        <h2 class="project-title">${this.escapeHtml(project.name)}</h2>
                        <span class="status-badge ${project.status}">${project.status}</span>
                        <p class="project-description">${this.escapeHtml(project.description)}</p>
                    </div>
                </div>

                <div class="project-details-grid">
                    <div class="detail-section">
                        <h3>Project Information</h3>
                        <div class="detail-item">
                            <label>Status:</label>
                            <span class="status-badge ${project.status}">${project.status}</span>
                        </div>
                        <div class="detail-item">
                            <label>Priority:</label>
                            <span class="priority-value">${project.priority}</span>
                        </div>
                        <div class="detail-item">
                            <label>Progress:</label>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${project.progress}%"></div>
                                <span class="progress-text">${project.progress}%</span>
                            </div>
                        </div>
                        <div class="detail-item">
                            <label>Deadline:</label>
                            <span>${this.formatDate(project.deadline)}</span>
                        </div>
                        ${project.budget ? `
                        <div class="detail-item">
                            <label>Budget:</label>
                            <span>$${project.budget}</span>
                        </div>
                        ` : ''}
                        ${project.tags && project.tags.length > 0 ? `
                        <div class="detail-item">
                            <label>Tags:</label>
                            <span>${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</span>
                        </div>
                        ` : ''}
                    </div>

                    <div class="detail-section">
                        <h3>Team & Leadership</h3>
                        <div class="detail-item">
                            <label>Project Leader:</label>
                            <span>${this.getLeaderName(project.leaderId)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Team Members:</label>
                            <span>${project.memberIds.length} member${project.memberIds.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div class="team-members">
                            ${project.memberIds.map(memberId => {
                                const user = this.app.getUsers().find(u => u.id === memberId);
                                return user ? `
                                    <div class="team-member-item">
                                        <div class="member-avatar">${user.name.charAt(0).toUpperCase()}</div>
                                        <div class="member-info">
                                            <span class="member-name">${this.escapeHtml(user.name)}</span>
                                            <span class="member-role">${user.role}</span>
                                        </div>
                                    </div>
                                ` : '';
                            }).filter(item => item).join('') || '<span class="no-members">No additional members</span>'}
                        </div>
                    </div>

                    <div class="detail-section">
                        <h3>Project Tasks</h3>
                        ${this.renderProjectTasksHTML(project.id)}
                    </div>

                    <div class="detail-section">
                        <h3>Timeline</h3>
                        <div class="timeline-item">
                            <label>Created:</label>
                            <span>${this.formatDate(project.createdAt)}</span>
                        </div>
                        ${project.updatedAt !== project.createdAt ? `
                        <div class="timeline-item">
                            <label>Last Updated:</label>
                            <span>${this.formatDate(project.updatedAt)}</span>
                        </div>
                        ` : ''}
                        ${project.completedAt ? `
                        <div class="timeline-item">
                            <label>Completed:</label>
                            <span>${this.formatDate(project.completedAt)}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        // Show custom modal
        this.showCustomModal(`Details: ${project.name}`, modalHTML, 'large');
    }

    /**
     * Render project tasks HTML for view modal
     */
    renderProjectTasksHTML(projectId) {
        const tasks = this.app.getProjectTasks(projectId);

        if (tasks.length === 0) {
            return '<span class="no-tasks">No tasks assigned to this project yet</span>';
        }

        return tasks.map(task => `
            <div class="task-summary-item">
                <div class="task-info">
                    <span class="task-title">${this.escapeHtml(task.title)}</span>
                    <span class="status-badge ${task.status}">${task.status}</span>
                </div>
                <div class="task-meta">
                    <span>Assigned to: ${this.getAssigneeName(task.assignedTo)}</span>
                    <span>Due: ${this.formatDate(task.dueDate)}</span>
                </div>
            </div>
        `).join('');
    }

    /**
     * Show custom modal
     */
    showCustomModal(title, content, size = 'default') {
        // Create overlay if it doesn't exist
        let overlay = document.getElementById('customModal');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'customModal';
            overlay.className = 'modal-overlay';
            document.body.appendChild(overlay);
        }

        overlay.innerHTML = `
            <div class="modal-container ${size === 'large' ? 'large' : ''}">
                <div class="modal-header">
                    <h2>${this.escapeHtml(title)}</h2>
                    <button class="modal-close" data-modal="customModal" title="Close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="modal-body">
                    ${content}
                </div>

                <div class="modal-footer">
                    <button class="btn btn-secondary modal-close" data-modal="customModal">Close</button>
                </div>
            </div>
        `;

        // Show modal
        overlay.classList.add('show');

        // Set up close events
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('show');
            }
        });

        const closeButtons = overlay.querySelectorAll('.modal-close');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                overlay.classList.remove('show');
            });
        });

        // Add CSS for custom modal if not exists
        if (!document.getElementById('project-details-styles')) {
            this.addProjectDetailsStyles();
        }
    }

    /**
     * Add custom CSS for project details modal
     */
    addProjectDetailsStyles() {
        const styles = document.createElement('style');
        styles.id = 'project-details-styles';
        styles.textContent = `
            .project-details-modal {
                font-family: var(--font-family-sans);
            }

            .project-details-header {
                margin-bottom: var(--space-6);
                padding-bottom: var(--space-4);
                border-bottom: 1px solid var(--color-outline-variant);
            }

            .project-details-header .project-title {
                color: var(--color-on-surface);
                margin-bottom: var(--space-2);
                font-size: var(--font-size-xl);
                font-weight: var(--font-weight-bold);
            }

            .project-details-header .status-badge {
                margin-left: 0;
            }

            .project-details-header .project-description {
                color: var(--color-on-surface-variant);
                margin: 0;
                line-height: var(--line-height-relaxed);
            }

            .project-details-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: var(--space-6);
            }

            .detail-section {
                background: var(--color-surface-variant);
                padding: var(--space-4);
                border-radius: var(--radius-md);
                border: 1px solid var(--color-outline-variant);
            }

            .detail-section h3 {
                color: var(--color-on-surface);
                margin-bottom: var(--space-3);
                font-size: var(--font-size-base);
                font-weight: var(--font-weight-semibold);
            }

            .detail-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: var(--space-2);
                font-size: var(--font-size-sm);
            }

            .detail-item label {
                color: var(--color-on-surface-variant);
                font-weight: var(--font-weight-medium);
            }

            .detail-item span {
                color: var(--color-on-surface);
            }

            .progress-bar {
                flex: 1;
                background: var(--color-surface);
                height: 20px;
                border-radius: var(--radius-full);
                overflow: hidden;
                position: relative;
            }

            .progress-fill {
                height: 100%;
                background: var(--color-primary-500);
                border-radius: var(--radius-full);
                transition: width 0.3s ease;
            }

            .progress-text {
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                color: white;
                font-size: var(--font-size-xs);
                font-weight: var(--font-weight-semibold);
            }

            .tag {
                display: inline-block;
                background: var(--color-primary-100);
                color: var(--color-primary-700);
                padding: var(--space-1) var(--space-2);
                border-radius: var(--radius-full);
                font-size: var(--font-size-xs);
                margin: 0 var(--space-1) var(--space-1) 0;
            }

            .team-members {
                margin-top: var(--space-2);
            }

            .team-member-item {
                display: flex;
                align-items: center;
                margin-bottom: var(--space-2);
            }

            .team-member-item .member-avatar {
                width: 32px;
                height: 32px;
                background: var(--color-primary-500);
                color: white;
                border-radius: var(--radius-full);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: var(--font-size-sm);
                font-weight: var(--font-weight-bold);
                margin-right: var(--space-2);
                flex-shrink: 0;
            }

            .team-member-item .member-info {
                flex: 1;
            }

            .team-member-item .member-name {
                display: block;
                color: var(--color-on-surface);
                font-weight: var(--font-weight-medium);
                font-size: var(--font-size-sm);
                margin-bottom: 2px;
            }

            .team-member-item .member-role {
                display: block;
                color: var(--color-on-surface-variant);
                font-size: var(--font-size-xs);
                text-transform: capitalize;
            }

            .task-summary-item {
                border: 1px solid var(--color-outline-variant);
                border-radius: var(--radius-sm);
                padding: var(--space-3);
                margin-bottom: var(--space-2);
                background: white;
            }

            .task-summary-item .task-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: var(--space-1);
            }

            .task-summary-item .task-title {
                font-weight: var(--font-weight-medium);
                color: var(--color-on-surface);
            }

            .task-summary-item .task-meta {
                font-size: var(--font-size-xs);
                color: var(--color-on-surface-variant);
                display: flex;
                justify-content: space-between;
            }

            .timeline-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: var(--space-2);
                font-size: var(--font-size-sm);
            }

            .timeline-item label {
                color: var(--color-on-surface-variant);
                font-weight: var(--font-weight-medium);
            }

            .no-tasks, .no-members {
                color: var(--color-on-surface-variant);
                font-style: italic;
                font-size: var(--font-size-sm);
            }

            @media (max-width: 768px) {
                .project-details-grid {
                    grid-template-columns: 1fr;
                    gap: var(--space-4);
                }

                .project-details-header .project-title {
                    font-size: var(--font-size-lg);
                }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Edit project
     */
    editProject(projectId) {
        const project = this.app.getProjects().find(p => p.id === projectId);
        if (!project) return;

        // Check permissions - leader or admin can edit
        const currentUser = this.app.getCurrentUser();
        if (!currentUser) return;

        const canEdit = currentUser.role === 'admin' || project.leaderId === currentUser.id;

        if (!canEdit) {
            this.app.showNotification('Only the project leader or admin can edit this project.', 'error');
            return;
        }

        // Open project modal with data pre-filled
        this.openProjectModal(project);
        this.app.showNotification(`Editing project: ${project.name}`, 'info');
    }

    /**
     * Update existing project
     */
    async updateProject(projectId, formData) {
        try {
            const project = this.app.getProjects().find(p => p.id === projectId);
            if (!project) {
                throw new Error('Project not found');
            }

            // Check permissions
            const currentUser = this.app.getCurrentUser();
            const canEdit = currentUser.role === 'admin' || project.leaderId === currentUser.id;

            if (!canEdit) {
                throw new Error('Only the project leader or admin can edit this project.');
            }

            // Get selected members from the multi-select component
            const selectedMembers = window.projectMemberSelector?.getSelectedMembers() || [];
            const memberIds = selectedMembers.map(member => member.id);

            // Always include current user as leader
            if (currentUser && !memberIds.includes(currentUser.id)) {
                memberIds.unshift(currentUser.id); // Leader first
            }

            // Update project data
            project.name = formData.name;
            project.description = formData.description;
            project.deadline = formData.deadline;
            project.status = formData.status;
            project.priority = formData.priority;
            project.budget = parseFloat(formData.budget) || 0;
            project.tags = formData.tags; // Already an array from formData
            project.memberIds = memberIds; // Update members from multi-select
            project.updatedAt = new Date().toISOString();

            // Validate project
            const validation = project.validate();
            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }

            this.app.updateProject(projectId, project);
            this.app.showNotification('Project updated successfully!', 'success');
            document.getElementById('projectModal').classList.remove('show');

            // Clear the data-project-id attribute
            const modal = document.getElementById('projectModal');
            if (modal) {
                modal.removeAttribute('data-project-id');
            }

            // Refresh projects view
            this.renderProjects();

        } catch (error) {
            this.app.showNotification(error.message, 'error');
        }
    }

    /**
     * Delete project
     */
    deleteProject(projectId) {
        const project = this.app.getProjects().find(p => p.id === projectId);
        if (!project) return;

        // Check permissions - leader or admin can delete
        const currentUser = this.app.getCurrentUser();
        if (!currentUser) return;

        const canDelete = currentUser.role === 'admin' || project.leaderId === currentUser.id;

        if (!canDelete) {
            this.app.showNotification('Only the project leader or admin can delete this project.', 'error');
            return;
        }

        if (confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
            // Remove project from state
            this.app.state.projects = this.app.state.projects.filter(p => p.id !== projectId);

            // Remove project role from users
            this.app.state.users.forEach(user => {
                if (user.projectRoles[projectId]) {
                    delete user.projectRoles[projectId];
                    user.updatedAt = new Date().toISOString();
                }
            });

            // Delete associated tasks
            this.app.state.tasks = this.app.state.tasks.filter(t => t.projectId !== projectId);

            this.app.saveData();
            this.app.showNotification('Project deleted successfully!', 'success');

            // Refresh projects view
            this.renderProjects();
        }
    }

    /**
     * Open create/edit project modal
     */
    openProjectModal(project = null) {
        const modal = document.getElementById('projectModal');
        const form = document.getElementById('projectForm');
        const modalTitle = modal?.querySelector('h2');
        const modalFooterInfo = modal?.querySelector('.modal-footer-info small');

        form.reset();

        if (project) {
            // Edit mode
            modal?.setAttribute('data-project-id', project.id);
            if (modalTitle) {
                modalTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Project';
            }
            if (modalFooterInfo) {
                modalFooterInfo.textContent = `Editing project: ${project.name}`;
            }

            // Pre-fill form
            document.getElementById('projectName').value = project.name;
            document.getElementById('projectDescription').value = project.description;
            document.getElementById('projectDeadline').value = project.deadline?.split('T')[0] || '';
            document.getElementById('projectStatus').value = project.status;
            document.getElementById('projectPriority').value = project.priority;
            document.getElementById('projectBudget').value = project.budget || '';
            document.getElementById('projectTags').value = project.tags?.join(', ') || '';

            // Load existing members
            this.loadProjectMembers(project);
        } else {
            // Create mode
            modal?.removeAttribute('data-project-id');
            if (modalTitle) {
                modalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Create New Project';
            }
            if (modalFooterInfo) {
                modalFooterInfo.textContent = 'You will be set as the project leader';
            }

            // Initialize empty member list (only current user)
            this.initializeProjectMembers();
        }

        modal?.classList.add('show');

        // Set up member management event handlers
        this.setupMemberManagementHandlers();

        // Initialize multi-select component with existing project members (for edit mode)
        setTimeout(() => {
            if (project) {
                // Get the existing members for pre-selection
                const allUsers = this.app.getUsers();
                const validMemberIds = project.memberIds.filter(memberId =>
                    memberId &&
                    memberId !== 'null' &&
                    memberId !== 'undefined' &&
                    memberId !== '' &&
                    allUsers.find(u => u && u.id === memberId)
                );

                const selectedUsers = validMemberIds.map(memberId => {
                    const user = allUsers.find(u => u && u.id === memberId);
                    return user ? {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    } : null;
                }).filter(user => user !== null);

                // Initialize multi-select with pre-selected members
                if (window.initializeProjectMemberSelectorWithMembers) {
                    window.initializeProjectMemberSelectorWithMembers(selectedUsers);
                }
            } else {
                // Initialize empty for new projects
                if (window.initializeProjectMemberSelectorWithMembers) {
                    const currentUser = this.app.getCurrentUser();
                    if (currentUser) {
                        window.initializeProjectMemberSelectorWithMembers([{
                            id: currentUser.id,
                            name: currentUser.name,
                            email: currentUser.email,
                            role: currentUser.role
                        }]);
                    }
                }
            }
        }, 50);
    }

    /**
     * Create new project
     */
    async createProject(formData) {
        try {
            // Get selected members from the multi-select component
            const selectedMembers = window.projectMemberSelector?.getSelectedMembers() || [];
            const memberIds = selectedMembers.map(member => member.id);

            // Always include current user as leader
            const currentUser = this.app.getCurrentUser();
            if (currentUser && !memberIds.includes(currentUser.id)) {
                memberIds.unshift(currentUser.id); // Leader first
            }

            const project = new Project({
                name: formData.name,
                description: formData.description,
                deadline: formData.deadline,
                status: formData.status,
                priority: formData.priority,
                budget: parseFloat(formData.budget) || 0,
                tags: formData.tags,
                leaderId: currentUser.id,
                memberIds: memberIds
            });

            // Validate project
            const validation = project.validate();
            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }

            this.app.addProject(project);
            this.app.showNotification('Project created successfully!', 'success');
            document.getElementById('projectModal')?.classList.remove('show');

            // Refresh projects view
            this.renderProjects();

        } catch (error) {
            this.app.showNotification(error.message, 'error');
        }
    }

    /**
     * Get leader name by ID
     */
    getLeaderName(leaderId) {
        if (!leaderId) return 'Unknown';

        // Try to find in users list first
        const users = this.app.getUsers();
        const leader = users.find(u => u.id === leaderId);
        if (leader) return leader.name;

        // If not found in users, check if it's the current user
        const currentUser = this.app.getCurrentUser();
        if (currentUser && currentUser.id === leaderId) {
            return currentUser.name;
        }

        // If still not found, try to load from member manager data service
        if (window.membersDataService) {
            const memberData = window.membersDataService.getMemberById(leaderId);
            if (memberData) {
                // Add to users if not present
                if (!users.find(u => u.id === leaderId)) {
                    const newUser = new User(memberData);
                    this.app.state.users.push(newUser);
                }
                return memberData.name;
            }

            // Check current user from member manager
            const currentMember = window.membersDataService.getCurrentUser();
            if (currentMember && currentMember.id === leaderId) {
                // Add current user to users if not present
                if (!users.find(u => u.id === leaderId)) {
                    const newUser = new User(currentMember);
                    this.app.state.users.unshift(newUser);
                }
                return currentMember.name;
            }
        }

        // Return fallback without showing error notification
        return 'Unknown';
    }

    /**
     * Format date for display
     */
    formatDate(dateString) {
        if (!dateString) return 'No deadline';
        return new Date(dateString).toLocaleDateString();
    }

    /**
     * Populate project dropdown for task creation
     */
    populateProjectDropdown() {
        const dropdown = document.getElementById('taskProject');
        if (!dropdown) return;

        const projects = this.app.getUserProjects();
        const currentValue = dropdown.value;

        // Clear existing options except the first one
        while (dropdown.children.length > 1) {
            dropdown.removeChild(dropdown.lastChild);
        }

        // Add project options
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            dropdown.appendChild(option);
        });

        // Restore previous selection if it exists
        if (currentValue && dropdown.querySelector(`option[value="${currentValue}"]`)) {
            dropdown.value = currentValue;
        }
    }

    /**
     * Initialize project members list (for new projects)
     */
    initializeProjectMembers() {
        const membersList = document.getElementById('projectMembersList');
        if (membersList) {
            const currentUser = this.app.getCurrentUser();
            // Clear existing members and add only the current user
            membersList.innerHTML = `
                <div class="member-chip current-user" data-member-id="${currentUser.id}">
                    You (Project Leader)
                    <button type="button" class="member-remove-btn" onclick="event.preventDefault(); return false;" disabled title="Cannot remove yourself as project leader">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }
    }

    /**
     * Load existing project members (for editing)
     */
    loadProjectMembers(project) {
        const membersList = document.getElementById('projectMembersList');
        if (!membersList || !project) return;

        const currentUser = this.app.getCurrentUser();
        const allUsers = this.app.getUsers();

        // Filter out invalid member IDs and ensure they exist in users list
        const validMemberIds = project.memberIds.filter(memberId =>
            memberId &&
            memberId !== 'null' &&
            memberId !== 'undefined' &&
            memberId !== '' &&
            allUsers.find(u => u && u.id === memberId)
        );

        // If we filtered out invalid IDs, update the project data
        if (validMemberIds.length !== project.memberIds.length) {
            console.warn(`Filtered out ${project.memberIds.length - validMemberIds.length} invalid member IDs from project "${project.name}"`);
            project.memberIds = validMemberIds;
            // Save the cleaned data
            this.app.saveData();
        }

        const membersHTML = validMemberIds.map(memberId => {
            const user = allUsers.find(u => u && u.id === memberId);
            if (!user) return '';

            const isLeader = project.leaderId === memberId;
            const isCurrentUser = currentUser && currentUser.id === memberId;

            return `
                <div class="member-chip ${isCurrentUser ? 'current-user' : ''}" data-member-id="${memberId}">
                    ${this.escapeHtml(user.name)}${isLeader ? ' (Project Leader)' : ''}
                    ${isCurrentUser && isLeader ? `
                        <button type="button" class="member-remove-btn" onclick="event.preventDefault(); return false;" disabled title="Cannot remove yourself as project leader">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : !isCurrentUser ? `
                        <button type="button" class="member-remove-btn" onclick="window.app.controllers.project.removeProjectMember('${memberId}')">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </div>
            `;
        }).filter(html => html).join('');

        membersList.innerHTML = membersHTML;

        // Sync with multi-select component
        if (window.projectMemberSelector && validMemberIds) {
            const selectedUsers = validMemberIds.map(memberId => {
                const user = allUsers.find(u => u && u.id === memberId);
                return user ? {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                } : null;
            }).filter(user => user !== null);

            // Set the selected members in the multi-select component
            window.projectMemberSelector.setSelectedMembers(selectedUsers);

            // Also store in sessionStorage for form submission
            sessionStorage.setItem('projectSelectedMembers', JSON.stringify(selectedUsers));
        }
    }

    /**
     * Add member to project with enhanced validation and error handling
     */
    addProjectMember(memberId) {
        try {
            // Input validation
            if (!memberId || memberId === '' || memberId === 'null' || memberId === 'undefined') {
                this.app.showNotification('Please select a valid member to add.', 'error');
                return false;
            }

            // Get DOM elements (cache for performance)
            const memberSelectGroup = document.getElementById('memberSelectGroup');
            const projectMemberSelect = document.getElementById('projectMemberSelect');
            const membersList = document.getElementById('projectMembersList');

            if (!membersList) {
                console.error('Project members list container not found');
                this.app.showNotification('Unable to add member: UI element missing.', 'error');
                return false;
            }

            // Check if member is already added (more efficient check)
            const existingChip = membersList.querySelector(`.member-chip[data-member-id="${memberId}"]`);
            if (existingChip) {
                this.app.showNotification('This member is already in the project.', 'warning');
                return false;
            }

            // Find user with better error handling (use string comparison for IDs)
            const user = this.app.getUsers().find(u => u && String(u.id) === String(memberId));
            if (!user) {
                console.error(`User with ID ${memberId} not found in users list`);
                this.app.showNotification('Selected member not found. Please refresh and try again.', 'error');
                return false;
            }

            // Check if user is active
            if (user.isActive === false) {
                this.app.showNotification(`${user.name} is inactive and cannot be added to projects.`, 'warning');
                return false;
            }

            // Create member chip with improved structure
            const memberChip = this.createMemberChip(user);
            if (!memberChip) {
                this.app.showNotification('Failed to create member element.', 'error');
                return false;
            }

            // Add to DOM
            membersList.appendChild(memberChip);

            // Reset and hide selector
            if (projectMemberSelect) {
                projectMemberSelect.value = '';
            }
            if (memberSelectGroup) {
                memberSelectGroup.style.display = 'none';
            }

            // Success feedback
            this.app.showNotification(`Successfully added ${this.escapeHtml(user.name)} to the project.`, 'success');
            return true;

        } catch (error) {
            console.error('Error adding project member:', error);
            this.app.showNotification('An error occurred while adding the member. Please try again.', 'error');
            return false;
        }
    }

    /**
     * Create a member chip element with proper structure
     */
    createMemberChip(user) {
        if (!user || !user.id || !user.name) {
            console.error('Invalid user data provided to createMemberChip');
            return null;
        }

        const memberChip = document.createElement('div');
        memberChip.className = 'member-chip';
        memberChip.setAttribute('data-member-id', user.id);
        memberChip.setAttribute('data-user-name', this.escapeHtml(user.name));

        // Create member name span
        const nameSpan = document.createElement('span');
        nameSpan.className = 'member-name';
        nameSpan.textContent = user.name;
        memberChip.appendChild(nameSpan);

        // Create remove button
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'member-remove-btn';
        removeBtn.title = `Remove ${user.name} from project`;
        removeBtn.setAttribute('aria-label', `Remove ${user.name} from project`);
        removeBtn.onclick = () => {
            if (window.app && window.app.controllers && window.app.controllers.project) {
                window.app.controllers.project.removeProjectMember(user.id);
            }
        };

        const icon = document.createElement('i');
        icon.className = 'fas fa-times';
        removeBtn.appendChild(icon);
        memberChip.appendChild(removeBtn);

        return memberChip;
    }

    /**
     * Remove member from project
     */
    removeProjectMember(memberId) {
        const membersList = document.getElementById('projectMembersList');
        const memberChip = membersList.querySelector(`.member-chip[data-member-id="${memberId}"]`);

        if (!memberChip) return;

        const user = this.app.getUsers().find(u => u.id === memberId);
        const memberName = user ? user.name : 'Unknown member';

        // Confirm removal
        if (!confirm(`Remove ${memberName} from this project?`)) {
            return;
        }

        memberChip.remove();
        this.app.showNotification(`Removed ${memberName} from the project.`, 'info');
    }

    /**
     * Set up member management event handlers
     */
    setupMemberManagementHandlers() {
        const addMemberBtn = document.getElementById('addMemberBtn');
        const cancelAddMember = document.getElementById('cancelAddMember');
        const confirmAddMember = document.getElementById('confirmAddMember');
        const projectMemberSelect = document.getElementById('projectMemberSelect');
        const memberSelectGroup = document.getElementById('memberSelectGroup');

        // Populate member dropdown options
        if (projectMemberSelect) {
            this.populateMemberDropdown();

            // Add change listener to validate selection
            projectMemberSelect.addEventListener('change', (e) => {
                const selectedId = e.target.value;
                if (selectedId) {
                    const users = this.app.getUsers();
                    console.log('Looking for user ID:', selectedId, '(type:', typeof selectedId, ')');
                    console.log('Available users in app:', users.map(u => ({ id: u.id, type: typeof u.id })));
                    // Use string comparison to handle number/string mismatches
                    const user = users.find(u => String(u.id) === String(selectedId));
                    if (!user) {
                        console.warn(`Selected user ID ${selectedId} not found in current user list. All user IDs:`, users.map(u => u.id));
                        this.populateMemberDropdown();
                        this.app.showNotification('User list refreshed. Please select the member again.', 'info');
                        e.target.value = '';
                        return;
                    } else {
                        console.log('Found user:', user.name, 'with ID:', user.id, '(type:', typeof user.id, ')');
                    }
                }
            });
        }

        // Add member button
        if (addMemberBtn) {
            addMemberBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (memberSelectGroup.style.display === 'none' || memberSelectGroup.style.display === '') {
                    memberSelectGroup.style.display = 'block';
                } else {
                    memberSelectGroup.style.display = 'none';
                }
            });
        }

        // Cancel add member
        if (cancelAddMember) {
            cancelAddMember.addEventListener('click', () => {
                memberSelectGroup.style.display = 'none';
                projectMemberSelect.value = '';
            });
        }

        // Confirm add member
        if (confirmAddMember) {
            confirmAddMember.addEventListener('click', () => {
                const selectedMemberId = projectMemberSelect.value;
                this.addProjectMember(selectedMemberId);
            });
        }
    }

    /**
     * Populate member dropdown with available users
     */
    populateMemberDropdown() {
        const projectMemberSelect = document.getElementById('projectMemberSelect');
        if (!projectMemberSelect) return;

        const currentUser = this.app.getCurrentUser();
        const allUsers = this.app.getUsers();

        // Get currently selected members
        const membersList = document.getElementById('projectMembersList');
        const currentMembers = Array.from(membersList.querySelectorAll('.member-chip'))
            .map(chip => chip.getAttribute('data-member-id'))
            .filter(id => id && id !== 'null' && id !== 'undefined' && id !== '');

        // Filter out current user and already added members
        const availableUsers = allUsers.filter(user =>
            user &&
            user.id &&
            user.id !== (currentUser ? currentUser.id : null) &&
            !currentMembers.includes(user.id) &&
            user.isActive !== false // Only show active users
        );

        // Debug logging to help identify issues
        console.log('Available users for dropdown:', availableUsers.map(u => ({ id: u.id, name: u.name })));
        console.log('Current members:', currentMembers);

        projectMemberSelect.innerHTML = '<option value="">Choose a team member...</option>' +
            availableUsers.map(user => `<option value="${user.id}">${this.escapeHtml(user.name)} (${user.role || 'member'})</option>`).join('');
    }

    /**
     * Get selected members from the chips
     */
    getSelectedMembers() {
        const membersList = document.getElementById('projectMembersList');
        if (!membersList) return [];

        return Array.from(membersList.querySelectorAll('.member-chip'))
            .map(chip => chip.getAttribute('data-member-id'))
            .filter(id => id !== null && id !== '');
    }

    /**
     * Render project statistics overview
     */
    renderProjectStats(projects) {
        if (projects.length === 0) return '';

        const totalProjects = projects.length;
        const activeProjects = projects.filter(p => p.status === 'In Progress').length;
        const completedProjects = projects.filter(p => p.status === 'Completed').length;
        const urgentProjects = projects.filter(p => p.priority === 'urgent').length;
        const totalTasks = projects.reduce((sum, p) => sum + this.getProjectTasksCount(p.id), 0);
        const overdueProjects = projects.filter(p =>
            p.deadline && new Date(p.deadline) < new Date() && p.status !== 'Completed'
        ).length;

        return `
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-project-diagram"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">${totalProjects}</div>
                    <div class="stat-label">Total Projects</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-play-circle"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">${activeProjects}</div>
                    <div class="stat-label">Active Projects</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">${completedProjects}</div>
                    <div class="stat-label">Completed</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">${urgentProjects}</div>
                    <div class="stat-label">Urgent Priority</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-tasks"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">${totalTasks}</div>
                    <div class="stat-label">Total Tasks</div>
                </div>
            </div>

            ${overdueProjects > 0 ? `
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">${overdueProjects}</div>
                    <div class="stat-label">Overdue</div>
                </div>
            </div>
            ` : ''}
        `;
    }

    /**
     * Calculate project progress based on completed tasks
     */
    calculateProjectProgress(project) {
        const tasks = this.app.getProjectTasks(project.id);
        if (tasks.length === 0) return 0;

        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        return Math.round((completedTasks / tasks.length) * 100);
    }

    /**
     * Get count of urgent tasks for a project
     */
    getUrgentTasksCount(projectId) {
        const tasks = this.app.getProjectTasks(projectId);
        return tasks.filter(task =>
            task.priority === 'urgent' ||
            (task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed')
        ).length;
    }

    /**
     * Get total task count for a project
     */
    getProjectTasksCount(projectId) {
        return this.app.getProjectTasks(projectId).length;
    }

    /**
     * View project timeline/activity history
     */
    viewProjectTimeline(projectId) {
        const project = this.app.getProjects().find(p => p.id === projectId);
        if (!project) return;

        const tasks = this.app.getProjectTasks(projectId);

        // Create timeline activities
        const activities = [];

        // Project creation
        activities.push({
            type: 'project',
            icon: 'fas fa-plus-circle',
            title: 'Project Created',
            description: `${project.name} was created`,
            timestamp: new Date(project.createdAt),
            color: 'primary'
        });

        // Task activities
        tasks.forEach(task => {
            activities.push({
                type: 'task',
                icon: 'fas fa-tasks',
                title: `Task ${task.status}: ${task.title}`,
                description: task.status === 'completed' ? 'Task marked as completed' : `Task assigned to ${this.getAssigneeName(task.assignedTo)}`,
                timestamp: new Date(task.createdAt),
                color: task.status === 'completed' ? 'success' : 'info'
            });

            if (task.status === 'completed' && task.completedAt) {
                activities.push({
                    type: 'task_complete',
                    icon: 'fas fa-check-circle',
                    title: `Task Completed: ${task.title}`,
                    description: 'Task completed successfully',
                    timestamp: new Date(task.completedAt),
                    color: 'success'
                });
            }
        });

        // Sort by timestamp (newest first)
        activities.sort((a, b) => b.timestamp - a.timestamp);

        const timelineHTML = `
            <div class="timeline-container">
                <div class="timeline-header">
                    <h3>Project Timeline: ${this.escapeHtml(project.name)}</h3>
                    <p>${activities.length} activities recorded</p>
                </div>

                <div class="timeline-list">
                    ${activities.map(activity => `
                        <div class="timeline-item">
                            <div class="timeline-icon ${activity.color}">
                                <i class="${activity.icon}"></i>
                            </div>
                            <div class="timeline-content">
                                <div class="timeline-title">${activity.title}</div>
                                <div class="timeline-description">${activity.description}</div>
                                <div class="timeline-time">${this.formatTimeAgo(activity.timestamp)}</div>
                            </div>
                        </div>
                    `).join('')}

                    ${activities.length === 0 ? `
                        <div class="timeline-empty">
                            <p>No activities recorded yet</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        this.showCustomModal(`Timeline: ${project.name}`, timelineHTML, 'large');
    }

    /**
     * Format time ago for timeline
     */
    formatTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        const diffWeeks = Math.floor(diffDays / 7);
        const diffMonths = Math.floor(diffDays / 30);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
        return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
    }

    /**
     * Get assignee name for tasks
     */
    getAssigneeName(assignedTo) {
        if (!assignedTo) return 'Unassigned';
        const user = this.app.getUsers().find(u => u.id === assignedTo);
        return user ? user.name : 'Unknown';
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
