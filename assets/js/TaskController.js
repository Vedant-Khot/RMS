/**
 * Task Controller
 * Handles task-related functionality
 */
class TaskController {
    constructor(app) {
        this.app = app;
    }

    /**
     * Called when tasks tab is activated
     */
    onTabActivated() {
        this.renderTasks();
    }

    /**
     * Update tasks view
     */
    updateView() {
        this.renderTasks();
    }

    /**
     * Render tasks dashboard
     */
    renderTasks() {
        const tasks = this.app.getTasks();
        const container = document.getElementById('tasksContainer');
        const emptyState = document.getElementById('tasksEmptyState');

        if (!container) return;

        if (tasks.length === 0) {
            container.innerHTML = '';
            emptyState?.classList.remove('hidden');
            return;
        }

        emptyState?.classList.add('hidden');

        container.innerHTML = tasks.map(task => `
            <div class="task-card">
                <div class="task-header">
                    <h4 class="task-title">${this.escapeHtml(task.title)}</h4>
                    <span class="status-badge ${task.status}">${task.status}</span>
                </div>
                <p class="task-description">${this.escapeHtml(task.description)}</p>
                <div class="task-meta">
                    <span><i class="fas fa-user"></i> ${this.getAssigneeName(task.assignedTo)}</span>
                    <span><i class="fas fa-clock"></i> ${task.estimatedHours || 0}h</span>
                    <span><i class="fas fa-calendar"></i> ${this.formatDate(task.dueDate)}</span>
                </div>
                <div class="task-actions">
                    <button class="btn btn-secondary btn-sm" onclick="if(window.app && window.app.controllers && window.app.controllers.task) window.app.controllers.task.editTask('${task.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="if(window.app && window.app.controllers && window.app.controllers.task) window.app.controllers.task.deleteTask('${task.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Open create/edit task modal
     */
    openTaskModal(task = null) {
        const modal = document.getElementById('taskModal');
        const form = document.getElementById('taskForm');
        const modalTitle = modal?.querySelector('h2');

        // Populate project select
        this.populateProjectSelect();

        // Populate member select
        this.populateAssignedToSelect();

        form.reset();

        if (task) {
            // Edit mode
            modal?.setAttribute('data-task-id', task.id);
            if (modalTitle) {
                modalTitle.innerHTML = '<i class="fas fa-tasks"></i> Edit Task';
            }

            // Pre-fill form
            document.getElementById('taskProject').value = task.projectId || '';
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskAssignedTo').value = task.assignedTo || '';
            document.getElementById('taskHours').value = task.estimatedHours || '';
            document.getElementById('taskDate').value = task.dueDate?.split('T')[0] || '';
            document.getElementById('taskTags').value = task.tags?.join(', ') || '';

            // Update member select based on selected project
            this.populateAssignedToSelect(task.projectId);
        } else {
            // Create mode
            modal?.removeAttribute('data-task-id');
            if (modalTitle) {
                modalTitle.innerHTML = '<i class="fas fa-tasks"></i> Add New Task';
            }
        }

        modal?.classList.add('show');

        // Set up project change listener to update member list
        const projectSelect = document.getElementById('taskProject');
        if (projectSelect) {
            projectSelect.addEventListener('change', (e) => {
                this.populateAssignedToSelect(e.target.value);
                // Clear assignedTo to prevent invalid assignment when project changes
                document.getElementById('taskAssignedTo').value = '';
            });
        }
    }

    /**
     * Edit task
     */
    editTask(taskId) {
        const task = this.app.getTasks().find(t => t.id === taskId);
        if (!task) return;

        // Check permissions - task creator, assigned user, or project leader/admin can edit
        const currentUser = this.app.getCurrentUser();
        if (!currentUser) return;

        const project = this.app.getProjects().find(p => p.id === task.projectId);
        const canEdit = currentUser.role === 'admin' ||
                       (project && project.leaderId === currentUser.id) ||
                       task.createdBy === currentUser.id ||
                       task.assignedTo === currentUser.id;

        if (!canEdit) {
            this.app.showNotification('You do not have permission to edit this task.', 'error');
            return;
        }

        // Open task modal in edit mode
        this.openTaskModal(task);
        this.app.showNotification(`Editing task: ${task.title}`, 'info');
    }

    /**
     * Update existing task
     */
    async updateTask(taskId, formData) {
        try {
            const task = this.app.getTasks().find(t => t.id === taskId);
            if (!task) {
                throw new Error('Task not found');
            }

            // Check permissions
            const currentUser = this.app.getCurrentUser();
            const project = this.app.getProjects().find(p => p.id === task.projectId);
            const canEdit = currentUser.role === 'admin' ||
                           (project && project.leaderId === currentUser.id) ||
                           task.createdBy === currentUser.id ||
                           task.assignedTo === currentUser.id;

            if (!canEdit) {
                throw new Error('You do not have permission to edit this task.');
            }

            // Get assigned from form data
            const assignedTo = formData.assignedTo || null;

            // Validate that assignedTo is provided
            if (!assignedTo) {
                throw new Error('Please select a team member to assign this task to.');
            }

            // Validate that assignedTo exists in the system
            if (formData.projectId) {
                const isValidAssignee = this.app.getUsers().find(u => u.id === assignedTo) !== undefined;

                if (!isValidAssignee) {
                    throw new Error('The selected user does not exist in the system.');
                }
            }

            // Update task data
            task.projectId = formData.projectId;
            task.title = formData.title;
            task.description = formData.description;
            task.priority = formData.priority;
            task.assignedTo = assignedTo;
            task.estimatedHours = parseFloat(formData.estimatedHours) || 1;
            task.dueDate = formData.dueDate;
            task.tags = formData.tags; // Already an array from formData
            task.updatedAt = new Date().toISOString();

            // Validate task
            const validation = task.validate();
            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }

            this.app.updateTask(taskId, task);
            this.app.showNotification('Task updated successfully!', 'success');
            document.getElementById('taskModal').classList.remove('show');

            // Refresh tasks view
            this.renderTasks();

        } catch (error) {
            this.app.showNotification(error.message, 'error');
        }
    }

    /**
     * Delete task
     */
    deleteTask(taskId) {
        const task = this.app.getTasks().find(t => t.id === taskId);
        if (!task) return;

        // Check permissions - task creator, assigned user, or project leader/admin can delete
        const currentUser = this.app.getCurrentUser();
        if (!currentUser) return;

        const project = this.app.getProjects().find(p => p.id === task.projectId);
        const canDelete = currentUser.role === 'admin' ||
                         (project && project.leaderId === currentUser.id) ||
                         task.createdBy === currentUser.id ||
                         task.assignedTo === currentUser.id;

        if (!canDelete) {
            this.app.showNotification('You do not have permission to delete this task.', 'error');
            return;
        }

        if (confirm(`Are you sure you want to delete "${task.title}"? This action cannot be undone.`)) {
            // Remove task from state
            this.app.state.tasks = this.app.state.tasks.filter(t => t.id !== taskId);
            this.app.saveData();
            this.app.showNotification('Task deleted successfully!', 'success');

            // Refresh tasks view
            this.renderTasks();
        }
    }

    /**
     * Populate project select dropdown
     */
    populateProjectSelect() {
        const select = document.getElementById('taskProject');
        if (!select) return;

        const currentUser = this.app.getCurrentUser();
        let projects;

        // Show all projects for admins, otherwise just user's projects
        if (currentUser && currentUser.role === 'admin') {
            projects = this.app.getProjects();
        } else {
            projects = this.app.getUserProjects();
        }

        select.innerHTML = '<option value="">Select a project...</option>' +
            projects.map(project => `<option value="${project.id}">${this.escapeHtml(project.name)}</option>`).join('');
    }

    /**
     * Populate assigned to select dropdown based on selected project
     */
    populateAssignedToSelect(projectId = null) {
        const select = document.getElementById('taskAssignedTo');
        if (!select) return;

        let projectMembers = [];
        if (projectId) {
            const project = this.app.getProjects().find(p => p.id === projectId);
            if (project) {
                projectMembers = project.memberIds.map(id => this.app.getUsers().find(u => u.id === id)).filter(u => u);

                // Include the project leader if not already in the list
                const leader = this.app.getUsers().find(u => u.id === project.leaderId);
                if (leader && !project.memberIds.includes(project.leaderId)) {
                    projectMembers.unshift(leader); // Add leader at the beginning
                }
            }
        } else {
            // Show all team members if no project selected
            projectMembers = this.app.getUsers().filter(u => u.isActive !== false);
        }

        select.innerHTML = '<option value="">Select a team member...</option>' +
            projectMembers.map(member => `<option value="${member.id}">${this.escapeHtml(member.name)} (${member.email})</option>`).join('');
    }

    /**
     * Create new task
     */
    async createTask(formData) {
        try {
            // Get assigned from form data
            const assignedTo = formData.assignedTo || null;

            // Validate that assignedTo is provided
            if (!assignedTo) {
                throw new Error('Please select a team member to assign this task to.');
            }

            // Validate that assignedTo exists in the system
            if (formData.projectId) {
                const isValidAssignee = this.app.getUsers().find(u => u.id === assignedTo) !== undefined;

                if (!isValidAssignee) {
                    throw new Error('The selected user does not exist in the system.');
                }
            }

            const task = new Task({
                projectId: formData.projectId,
                assignedTo: assignedTo,
                title: formData.title,
                description: formData.description,
                priority: formData.priority,
                estimatedHours: formData.estimatedHours,
                dueDate: formData.dueDate,
                tags: formData.tags,
                status: 'todo',
                createdBy: this.app.getCurrentUser().id
            });

            // Validate task
            const validation = task.validate();
            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }

            this.app.addTask(task);
            this.app.showNotification('Task created successfully!', 'success');
            document.getElementById('taskModal')?.classList.remove('show');

            // Refresh tasks view
            this.renderTasks();

        } catch (error) {
            this.app.showNotification(error.message, 'error');
        }
    }

    /**
     * Get assignee name by ID
     */
    getAssigneeName(userId) {
        const user = this.app.getUsers().find(u => u.id === userId);
        return user ? user.name : 'Unassigned';
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
