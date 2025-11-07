/**
 * Analytics Controller
 * Handles analytics and reporting functionality
 */
class AnalyticsController {
    constructor(app) {
        this.app = app;
        this.charts = {};
        this.currentPeriod = 30; // Default to last 30 days
    }

    /**
     * Called when analytics tab is activated
     */
    onTabActivated() {
        console.log('🎯 Analytics tab activated');
        this.renderAnalytics();
        this.setupEventListeners();
        console.log('✅ Analytics setup complete');
    }

    /**
     * Set up event listeners for analytics components
     */
    setupEventListeners() {
        // Date filter listener
        const periodSelect = document.getElementById('analyticsPeriod');
        if (periodSelect) {
            periodSelect.value = this.currentPeriod;
            periodSelect.addEventListener('change', (e) => {
                this.currentPeriod = parseInt(e.target.value);
                this.renderAnalytics();
            });
        }
    }

    /**
     * Render analytics dashboard
     */
    renderAnalytics() {
        const container = document.getElementById('analyticsGrid');
        if (!container) return;

        const stats = this.calculateStats();

        container.innerHTML = `
            <div class="analytics-card clickable" data-type="projects">
                <h3>Total Projects</h3>
                <div class="stat-number">${stats.totalProjects}</div>
                <div class="stat-trend ${stats.projectsTrend}">${stats.projectsChange}</div>
                <div class="stat-detail">Click to open Projects tab</div>
            </div>
            <div class="analytics-card clickable" data-type="tasks">
                <h3>Active Tasks</h3>
                <div class="stat-number">${stats.activeTasks}</div>
                <div class="stat-trend ${stats.tasksTrend}">${stats.tasksChange}</div>
                <div class="stat-detail">Click to open Tasks tab</div>
            </div>
            <div class="analytics-card clickable" data-type="members">
                <h3>Team Members</h3>
                <div class="stat-number">${stats.totalMembers}</div>
                <div class="stat-trend positive">Active</div>
                <div class="stat-detail">Click to open Members tab</div>
            </div>
            <div class="analytics-card clickable" data-type="completion">
                <h3>Completion Rate</h3>
                <div class="stat-number">${stats.completionRate}%</div>
                <div class="stat-trend ${stats.completionTrend}">${stats.completionChange}</div>
                <div class="stat-detail">Analytics overview</div>
            </div>
        `;

        // Add click event listeners to cards
        const cards = container.querySelectorAll('.analytics-card.clickable');
        console.log(`Found ${cards.length} clickable analytics cards`);
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                console.log('🎯 Analytics card clicked:', card.getAttribute('data-type'));
                const type = card.getAttribute('data-type');
                this.handleCardClick(type);
            });
        });
    }

    /**
     * Handle card click - switch to corresponding tab
     */
    handleCardClick(type) {
        console.log('🔄 Switching to tab:', type);
        let tabName = type;

        // Map analytics types to tab names
        if (type === 'completion') {
            // For completion, stay on analytics but show a toast or highlight
            this.app.showNotification('View completion analytics above', 'info');
            return;
        }

        // Switch to the corresponding tab
        this.app.handleTabChange(tabName);

        // Show a notification about the switch
        const messages = {
            'projects': 'Showing project details',
            'tasks': 'Showing task management',
            'members': 'Showing team management'
        };

        const message = messages[tabName] || `Showing ${tabName} section`;
        setTimeout(() => {
            this.app.showNotification(message, 'success');
        }, 300);
    }

    /**
     * Show detailed view for a specific metric
     */
    showDetailedView(type) {
        let title, content;

        switch (type) {
            case 'projects':
                title = 'Project Details';
                content = this.getProjectsDetail();
                break;
            case 'tasks':
                title = 'Active Tasks Overview';
                content = this.getTasksDetail();
                break;
            case 'members':
                title = 'Team Members Details';
                content = this.getMembersDetail();
                break;
            case 'completion':
                title = 'Completion Rate Analysis';
                content = this.getCompletionDetail();
                break;
            default:
                return;
        }

        this.showModal(title, content);
    }

    /**
     * Get detailed projects information
     */
    getProjectsDetail() {
        const projects = this.app.getProjects();
        const completedProjects = projects.filter(p => p.status === 'completed').length;

        let html = '<div class="analytics-detail-content">';
        html += '<div class="detail-summary">'
        html += `<h4>Total Projects: ${projects.length}</h4>`;
        html += `<p>Completed: ${completedProjects} | Active: ${projects.length - completedProjects}</p>`;
        html += '</div><div class="detail-list"><h4>Project Status:</h4><ul>';

        ['Planning', 'In Progress', 'Review', 'Completed', 'On Hold'].forEach(status => {
            const count = projects.filter(p => p.status === status).length;
            if (count > 0) {
                html += `<li>${status}: ${count} projects</li>`;
            }
        });

        html += '</ul><h4>Recent Projects:</h4><ul>';
        projects.slice(-5).reverse().forEach(project => {
            html += `<li><strong>${project.name}</strong> (${project.status})</li>`;
        });

        html += '</ul></div></div>';
        return html;
    }

    /**
     * Get detailed tasks information
     */
    getTasksDetail() {
        const tasks = this.app.getTasks();
        const activeTasks = tasks.filter(t => t.status !== 'completed');

        let html = '<div class="analytics-detail-content">';
        html += '<div class="detail-summary">'
        html += `<h4>Active Tasks: ${activeTasks.length}</h4>`;
        html += `<p>Completed: ${tasks.length - activeTasks.length} | Total: ${tasks.length}</p>`;
        html += '</div><div class="detail-list"><h4>Active Tasks:</h4><ul>';

        activeTasks.slice(0, 10).forEach(task => {
            const project = this.app.getProjects().find(p => p.id === task.projectId);
            const projectName = project ? project.name : 'Unknown Project';
            html += `<li><strong>${task.title}</strong> (${projectName}) - Priority: ${task.priority}</li>`;
        });

        if (activeTasks.length > 10) {
            html += `<li><em>... and ${activeTasks.length - 10} more tasks</em></li>`;
        }

        html += '</ul></div></div>';
        return html;
    }

    /**
     * Get detailed members information
     */
    getMembersDetail() {
        const users = this.app.getUsers();
        const projects = this.app.getProjects();

        let html = '<div class="analytics-detail-content">';
        html += '<div class="detail-summary">'
        html += `<h4>Team Members: ${users.length}</h4>`;
        html += '</div><div class="detail-list"><h4>Member Roles:</h4><ul>';

        users.forEach(user => {
            const projectCount = projects.filter(p => p.hasMember(user.id)).length;
            html += `<li><strong>${user.name}</strong> (${user.role}) - ${projectCount} projects</li>`;
        });

        html += '</ul></div></div>';
        return html;
    }

    /**
     * Get detailed completion information
     */
    getCompletionDetail() {
        const projects = this.app.getProjects();
        const tasks = this.app.getTasks();

        const completedProjects = projects.filter(p => p.status === 'completed').length;
        const completedTasks = tasks.filter(t => t.status === 'completed').length;

        const completionRate = projects.length > 0 ? Math.round((completedProjects / projects.length) * 100) : 0;
        const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

        let html = '<div class="analytics-detail-content">';
        html += '<div class="detail-summary">'
        html += `<h4>Overall Completion Rate: ${completionRate}%</h4>`;
        html += `<p>Task Completion Rate: ${taskCompletionRate}%</p>`;
        html += '</div><div class="detail-list"><h4>Project Completion Breakdown:</h4><ul>';
        html += `<li>Total Projects: ${projects.length}</li>`;
        html += `<li>Completed Projects: ${completedProjects}</li>`;
        html += `<li>Active Projects: ${projects.length - completedProjects}</li>`;
        html += `<li>Total Tasks: ${tasks.length}</li>`;
        html += `<li>Completed Tasks: ${completedTasks}</li>`;
        html += `<li>Active Tasks: ${tasks.length - completedTasks}</li>`;
        html += '</ul></div></div>';
        return html;
    }

    /**
     * Show modal with detailed information
     */
    showModal(title, content) {
        console.log('📊 Showing analytics modal:', title);
        console.log('Modal content length:', content.length);

        // Remove existing modal if present
        const existingModal = document.getElementById('analyticsModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHtml = `
            <div class="modal-overlay" id="analyticsModal">
                <div class="modal-container large">
                    <div class="modal-header">
                        <h2>${title}</h2>
                        <button class="modal-close btn btn-ghost" data-modal="analyticsModal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary modal-close" data-modal="analyticsModal">Close</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        console.log('Modal HTML added to DOM');

        const modal = document.getElementById('analyticsModal');
        console.log('Modal element found:', !!modal);
        if (modal) {
            console.log('Adding show class to modal');
            modal.classList.add('show');
            console.log('Modal should now be visible');
        }

        // Add close event listeners
        const closeButtons = modal.querySelectorAll('.modal-close');
        console.log('Found close buttons:', closeButtons.length);
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                console.log('Close button clicked, hiding modal');
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            });
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                console.log('Overlay clicked, hiding modal');
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
        });
    }

    /**
     * Calculate analytics statistics
     */
    calculateStats() {
        const projects = this.app.getProjects();
        const tasks = this.app.getTasks();
        const users = this.app.getUsers();

        const completedProjects = projects.filter(p => p.status === 'completed').length;
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const activeTasks = tasks.filter(t => t.status !== 'completed').length;

        const projectCompletionRate = projects.length > 0 ? Math.round((completedProjects / projects.length) * 100) : 0;
        const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

        // Calculate simple trends based on data
        // For now, show current state as neutral (no historical comparison available)
        const projectsTrend = completedProjects > 0 ? 'positive' : 'neutral';
        const tasksTrend = activeTasks < tasks.length ? 'positive' : 'neutral';
        const completionTrend = projectCompletionRate >= 50 ? 'positive' : 'neutral';

        return {
            totalProjects: projects.length,
            activeTasks: activeTasks,
            totalMembers: users.length,
            completionRate: projectCompletionRate,
            projectsTrend: projectsTrend,
            projectsChange: `${completedProjects}/${projects.length} completed`,
            tasksTrend: tasksTrend,
            tasksChange: `${taskCompletionRate}% completed`,
            completionTrend: completionTrend,
            completionChange: `${projectCompletionRate}% rate`
        };
    }
}
