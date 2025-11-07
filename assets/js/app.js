/**
 * RMS Application Bootstrap
 * Initializes and starts the application
 */

/**
 * RMS Application Bootstrap
 * Initializes and starts the application
 */

// Global application instance
let app = null;

/**
 * Multi-Select Team Member Component
 * Handles searchable, multi-select dropdown for team members
 */
class MultiSelectMembers {
    constructor(containerSelector, searchInputSelector, dropdownSelector, optionsContainerSelector, selectedListSelector, callback = null, membersData = null) {
        this.container = document.querySelector(containerSelector);
        this.searchInput = document.querySelector(searchInputSelector);
        this.dropdown = document.querySelector(dropdownSelector);
        this.optionsContainer = document.querySelector(optionsContainerSelector);
        this.selectedList = document.querySelector(selectedListSelector);
        this.callback = callback;
        this.membersData = membersData; // Allow passing in users data
        this.availableMembers = [];
        this.selectedMembers = [];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadAvailableMembers();
        this.render();
    }

    setupEventListeners() {
        // Check if elements exist before adding event listeners
        if (!this.searchInput || !this.container || !this.dropdown || !this.optionsContainer || !this.selectedList) {
            console.warn('MultiSelectMembers: Some required DOM elements not found, skipping event listener setup');
            return;
        }

        // Search input
        this.searchInput.addEventListener('input', (e) => this.onSearch(e.target.value));
        this.searchInput.addEventListener('focus', () => this.openDropdown());

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (this.container && !this.container.contains(e.target)) {
                this.closeDropdown();
            }
        });

        // Select All button
        const selectAllBtn = this.container.querySelector('#selectAllMembers');
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => this.selectAll());
        }

        // Clear All button
        const clearAllBtn = this.container.querySelector('#clearAllMembers');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => this.clearAll());
        }
    }

    loadAvailableMembers() {
        // If membersData was passed in, use it directly
        if (this.membersData && Array.isArray(this.membersData)) {
            this.availableMembers = [...this.membersData];
            return;
        }

        // Fallback to getting from localStorage (for backwards compatibility)
        // Get current user
        const currentUser = JSON.parse(localStorage.getItem('rms_current_user'));

        // Get team members
        const teamMembers = JSON.parse(localStorage.getItem('rms_team_members')) || [];

        // Combine and filter duplicates
        this.availableMembers = [];

        if (currentUser) {
            this.availableMembers.push({
                id: currentUser.id,
                name: currentUser.name,
                email: currentUser.email,
                role: currentUser.role
            });
        }

        // Add team members, avoiding duplicates
        teamMembers.forEach(member => {
            if (!this.availableMembers.some(m => m.id === member.id)) {
                this.availableMembers.push(member);
            }
        });
    }

    render() {
        this.renderOptions(this.availableMembers);
        this.renderSelectedMembers();
    }

    renderOptions(members) {
        if (!this.optionsContainer) return;

        this.optionsContainer.innerHTML = '';

        members.forEach(member => {
            const optionDiv = document.createElement('div');
            optionDiv.className = `multi-select-option ${this.isSelected(member.id) ? 'selected' : ''}`;
            optionDiv.innerHTML = `
                <input type="checkbox"
                       class="multi-select-checkbox"
                       id="member-${member.id}"
                       ${this.isSelected(member.id) ? 'checked' : ''}
                       data-member-id="${member.id}">
                <div class="multi-select-user-info">
                    <div class="multi-select-user-avatar">${member.name.charAt(0).toUpperCase()}</div>
                    <div class="multi-select-user-details">
                        <div class="multi-select-user-name">${member.name}</div>
                        <div class="multi-select-user-role">${member.email} • ${member.role}</div>
                    </div>
                </div>
            `;

            // Handle checkbox change
            const checkbox = optionDiv.querySelector('.multi-select-checkbox');
            checkbox.addEventListener('change', () => this.onMemberToggle(member.id));

            // Handle option click
            optionDiv.addEventListener('click', (e) => {
                if (e.target.tagName !== 'INPUT') {
                    checkbox.checked = !checkbox.checked;
                    this.onMemberToggle(member.id);
                }
            });

            this.optionsContainer.appendChild(optionDiv);
        });
    }

    renderSelectedMembers() {
        if (!this.selectedList) return;

        this.selectedList.innerHTML = '';

        this.selectedMembers.forEach(member => {
            const chip = document.createElement('div');
            chip.className = 'selected-member-chip';
            chip.innerHTML = `
                ${member.name}
                <button class="remove-member-btn" data-member-id="${member.id}">
                    <i class="fas fa-times"></i>
                </button>
            `;

            this.selectedList.appendChild(chip);
        });

        // Add event listeners to remove buttons
        this.selectedList.querySelectorAll('.remove-member-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const memberId = btn.getAttribute('data-member-id');
                this.removeMember(memberId);
                btn.parentElement.remove();
            });
        });

        // Add a dummy element if no members are selected to maintain height
        if (this.selectedMembers.length === 0) {
            const placeholder = document.createElement('div');
            placeholder.className = 'selected-member-placeholder';
            placeholder.innerHTML = '&nbsp;';
            this.selectedList.appendChild(placeholder);
        }
    }

    onMemberToggle(memberId) {
        const member = this.availableMembers.find(m => m.id === memberId);
        if (!member) return;

        if (this.isSelected(memberId)) {
            this.removeMember(memberId);
        } else {
            this.addMember(member);
        }

        this.updateUI();
        this.callback?.(this.selectedMembers);
    }

    addMember(member) {
        if (!this.isSelected(member.id)) {
            this.selectedMembers.push(member);
        }
    }

    removeMember(memberId) {
        this.selectedMembers = this.selectedMembers.filter(m => m.id !== memberId);

        // Update checkboxes if optionsContainer exists
        if (this.optionsContainer) {
            const checkboxes = this.optionsContainer.querySelectorAll('.multi-select-checkbox');
            checkboxes.forEach(checkbox => {
                if (checkbox.getAttribute('data-member-id') === memberId.toString()) {
                    checkbox.checked = false;
                }
            });
        }

        this.updateUI();
    }

    selectAll() {
        if (!this.optionsContainer) return;
        this.availableMembers.forEach(member => this.addMember(member));
        this.updateUI();
        this.callback?.(this.selectedMembers);
    }

    clearAll() {
        if (!this.optionsContainer) return;
        this.selectedMembers.forEach(member => {
            const checkbox = this.optionsContainer.querySelector(`[data-member-id="${member.id}"]`);
            if (checkbox) checkbox.checked = false;
        });
        this.selectedMembers = [];
        this.updateUI();
        this.callback?.(this.selectedMembers);
    }

    isSelected(memberId) {
        return this.selectedMembers.some(m => m.id === memberId);
    }

    onSearch(query) {
        const filtered = this.availableMembers.filter(member =>
            member.name.toLowerCase().includes(query.toLowerCase()) ||
            member.email.toLowerCase().includes(query.toLowerCase())
        );
        this.renderOptions(filtered);
        this.openDropdown();
    }

    openDropdown() {
        if (this.dropdown) {
            this.dropdown.classList.add('open');
        }
    }

    closeDropdown() {
        if (this.dropdown) {
            this.dropdown.classList.remove('open');
        }
    }

    updateUI() {
        this.renderOptions(this.availableMembers);
        this.renderSelectedMembers();
    }

    getSelectedMembers() {
        return this.selectedMembers;
    }

    setSelectedMembers(members) {
        this.selectedMembers = [...members];
        this.updateUI();
    }
}

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async () => {
    await initializeApp();
});

/**
 * Also try window load event as fallback
 */
window.addEventListener('load', async () => {
    // Only start if not already started
    if (!app) {
        await initializeApp();
    }
});

/**
 * Main app initialization function
 */
async function initializeApp() {
    try {
        console.log('🚀 Starting RMS Application...');

        // Create application instance
        console.log('📱 Creating AppController instance...');
        console.log('AppController exists:', typeof AppController);

        if (typeof AppController === 'undefined') {
            throw new Error('AppController class not found. Check if all scripts are loaded properly.');
        }

        app = new AppController();

        // Initialize the application
        console.log('🔄 Initializing application...');
        await app.initialize();
        console.log('✅ Application initialized successfully');

        // Set up global event handlers immediately since DOM is ready
        setupGlobalEventHandlers();

        // Set up default user for project creation
        console.log('👤 Setting up default user for development...');
        setTimeout(() => {
            app?.showNotification('Welcome to RMS - Ready for development!', 'success');
        }, 500);

        // Force render the projects to ensure UI is updated
        if (app && app.controllers && app.controllers.project) {
            console.log('🔄 Force rendering projects...');
            app.controllers.project.renderProjects();
        }

        console.log('%c🎊 RMS Application Successfully Loaded! 🎊',
            'color: green; font-size: 16px; font-weight: bold;');
        console.log('%cThe application is now ready for use. Check the UI for interactive elements.', 'color: blue;');

    } catch (error) {
        console.error('❌ Failed to start RMS Application:', error);
        console.error('Error stack:', error.stack);
        showErrorPage('Failed to load application. Please refresh the page.');
    }
}

/**
 * Show error page when application fails to load
 */
function showErrorPage(message) {
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="error-page">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2>Application Error</h2>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="window.location.reload()">
                    <i class="fas fa-refresh"></i>
                    Refresh Page
                </button>
            </div>
        `;
    }
}

/**
 * Global function to get application instance
 * Useful for debugging and external access
 */
window.getRMSApp = function() {
    return app;
};

/**
 * Set up global event handlers after app initialization
 */
function setupGlobalEventHandlers() {



    // Button event handlers
    const createProjectBtn = document.getElementById('createProjectBtn');
    if (createProjectBtn && app?.controllers?.project) {
        createProjectBtn.addEventListener('click', () => {
            app.controllers.project.openProjectModal();
        });
    }

    // Remove any existing project form handlers to avoid conflicts
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        // Remove existing listeners first
        const newProjectForm = projectForm.cloneNode(true);
        projectForm.parentNode.replaceChild(newProjectForm, projectForm);

        // Add new handler
        newProjectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation(); // Prevent any other handlers

            if (!app?.controllers?.project) return;

            // Get form data from the cloned form
            const formData = {
                name: newProjectForm.querySelector('#projectName').value,
                description: newProjectForm.querySelector('#projectDescription').value,
                deadline: newProjectForm.querySelector('#projectDeadline').value,
                status: newProjectForm.querySelector('#projectStatus').value,
                priority: newProjectForm.querySelector('#projectPriority').value,
                budget: parseFloat(newProjectForm.querySelector('#projectBudget').value) || 0,
                tags: newProjectForm.querySelector('#projectTags').value.split(',').map(tag => tag.trim()).filter(tag => tag)
            };

            // Check if we're editing or creating
            const modal = document.getElementById('projectModal');
            const projectId = modal?.getAttribute('data-project-id');

            console.log('Form submission:', { projectId, formData });

            if (projectId) {
                // Update existing project
                console.log('Updating project:', projectId);
                await app.controllers.project.updateProject(projectId, formData);
            } else {
                // Create new project
                console.log('Creating new project');
                await app.controllers.project.createProject(formData);
            }
        });
    }

    // Initialize multi-select component after modal shows
    document.addEventListener('click', function(e) {
        if (e.target.closest('[onclick*="openProjectModal"]') ||
            e.target.closest('#createProjectBtn')) {
            // For project modal, use 'project' type
            setTimeout(() => {
                window.initializeProjectMemberSelectorWithMembers([], 'project');
            }, 100);
        }
    });

    // Add global function to reinitialize multi-select with pre-selected members
    window.initializeProjectMemberSelectorWithMembers = function(preSelectedMembers = [], modalType = 'project') {
        // Determine which selector and selectors to use
        const isTask = modalType === 'task';
        const selectorName = isTask ? 'taskMemberSelector' : 'projectMemberSelector';
        const containerSelector = isTask ? '#taskModal .multi-select-container' : '#projectModal .multi-select-container';
        const searchSelector = isTask ? '#taskMemberSearch' : '#projectMemberSearch';
        const dropdownSelector = isTask ? '#taskMemberDropdown' : '#taskMemberDropdown';
        const optionsSelector = isTask ? '#taskMemberOptions' : '#projectMemberOptions';
        const selectedSelector = isTask ? '#selectedTaskMembers' : '#selectedProjectMembers';
        const sessionKey = isTask ? 'taskSelectedMembers' : 'projectSelectedMembers';

        // Get users from app if available
        let availableUsers = [];
        if (app && app.getUsers) {
            availableUsers = app.getUsers().map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }));
        }

        // Reset any existing instance
        if (window[selectorName]) {
            window[selectorName].closeDropdown();
        }

        // Create new instance with users data
        window[selectorName] = new MultiSelectMembers(
            containerSelector,
            searchSelector,
            dropdownSelector,
            optionsSelector,
            selectedSelector,
            (selected) => {
                console.log(`Selected ${modalType} members:`, selected);
                // Store selected members for form submission
                sessionStorage.setItem(sessionKey, JSON.stringify(selected));
            },
            availableUsers // Pass users data to constructor
        );

        // If we have pre-selected members, set them after a short delay to ensure component is ready
        if (preSelectedMembers.length > 0) {
            setTimeout(() => {
                if (window[selectorName]) {
                    window[selectorName].setSelectedMembers(preSelectedMembers);
                }
            }, 10);
        }
    };

    const createTaskBtn = document.getElementById('createTaskBtn');
    if (createTaskBtn && app?.controllers?.task) {
        createTaskBtn.addEventListener('click', () => {
            app.controllers.task.openTaskModal();
        });
    }

    // Task form submission handler
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!app?.controllers?.task) return;

            // Get form data
            const formData = {
                projectId: document.getElementById('taskProject')?.value,
                title: document.getElementById('taskTitle')?.value?.trim(),
                description: document.getElementById('taskDescription')?.value?.trim(),
                priority: document.getElementById('taskPriority')?.value,
                estimatedHours: parseFloat(document.getElementById('taskHours')?.value) || 1,
                dueDate: document.getElementById('taskDate')?.value,
                assignedTo: document.getElementById('taskAssignedTo')?.value,
                tags: (document.getElementById('taskTags')?.value || '').split(',').map(tag => tag.trim()).filter(tag => tag)
            };

            // Check if we're editing or creating
            const modal = document.getElementById('taskModal');
            const taskId = modal?.getAttribute('data-task-id');

            console.log('Task form submission:', { taskId, formData });

            if (taskId) {
                // Update existing task
                console.log('Updating task:', taskId);
                await app.controllers.task.updateTask(taskId, formData);
            } else {
                // Create mode - handle in TaskController
                console.log('Creating new task');
                await app.controllers.task.createTask(formData);
            }
        });
    }

    const manageRolesBtn = document.getElementById('manageRolesBtn');
    if (manageRolesBtn) {
        manageRolesBtn.addEventListener('click', () => {
            app.controllers.member.manageRoles();
        });
    }

    // Member form handler
    const memberForm = document.getElementById('memberForm');
    if (memberForm) {
        memberForm.addEventListener('submit', (e) => {
            if (app?.controllers?.member) {
                app.controllers.member.handleMemberFormSubmit(e);
            }
        });
    }

    console.log('✅ Global event handlers set up');

    // Initialize multi-select components
    initializeMultiSelectComponents();

/**
 * Initialize Multi-Select Components
 */
function initializeMultiSelectComponents() {
    // Get users from app if available
    let availableUsers = [];
    if (app && app.getUsers) {
        availableUsers = app.getUsers().map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }));
    }

    // Project member selector - only if elements exist
    if (document.querySelector('#projectModal .multi-select-container')) {
        const projectMemberSelector = new MultiSelectMembers(
            '#projectModal .multi-select-container',
            '#projectMemberSearch',
            '#projectMemberDropdown',
            '#projectMemberOptions',
            '#selectedProjectMembers',
            (selected) => {
                console.log('Selected project members:', selected);
                // Store selected members for form submission
                sessionStorage.setItem('projectSelectedMembers', JSON.stringify(selected));
            },
            availableUsers // Pass users data
        );

        // Make instance globally available
        window.projectMemberSelector = projectMemberSelector;
    }

    // Task member selector - only if elements exist
    if (document.querySelector('#taskModal .multi-select-container')) {
        const taskMemberSelector = new MultiSelectMembers(
            '#taskModal .multi-select-container',
            '#taskMemberSearch',
            '#taskMemberDropdown',
            '#taskMemberOptions',
            '#selectedTaskMembers',
            (selected) => {
                console.log('Selected task members:', selected);
                // Store selected members for form submission
                sessionStorage.setItem('taskSelectedMembers', JSON.stringify(selected));
            },
            availableUsers // Pass users data
        );

        // Make instance globally available
        window.taskMemberSelector = taskMemberSelector;
    }
}



}
