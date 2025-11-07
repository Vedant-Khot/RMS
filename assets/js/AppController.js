

/**
 * Main Application Controller
 * Coordinates all application functionality and manages global state
 */
class AppController {
    constructor() {
        this.storage = new StorageService();
        this.state = {};
        this.controllers = {};
        this.isInitialized = false;
        this.formValidators = {};

        // Email and notification services
        this.emailService = new EmailService();

        // Bind methods to maintain context
        this.initialize = this.initialize.bind(this);
        this.handleTabChange = this.handleTabChange.bind(this);
        this.handleThemeToggle = this.handleThemeToggle.bind(this);
        this.saveData = this.saveData.bind(this);
        this.checkDeadlineNotifications = this.checkDeadlineNotifications.bind(this);

        // Auto-save interval
        this.autoSaveInterval = null;

        // Notification checking interval
        this.notificationCheckInterval = null;

        // Track last notification timestamps
        this.lastOverdueNotification = {};
        this.lastUpcomingNotification = {};

        // Track daily email sending to prevent quota overuse
        this.dailyEmailTracker = {};
    }

    /**
     * Initialize the application
     */
    async initialize() {
        try {
            // Load data from storage
            this.state = this.storage.load();

            // Load users from the centralized members data service
            await this.loadUsers();

            // Refresh any open member dropdowns after user sync
            this.refreshMemberDropdowns();

            // Set current user
            if (!this.state.currentUser && this.state.users.length > 0) {
                this.state.currentUser = this.state.users[0];
            }

            // Initialize theme
            this.initializeTheme();

            // Initialize controllers
            await this.initializeControllers();

            // Set up event listeners
            this.setupEventListeners();

            // Load and apply EmailJS configuration
            this.loadEmailJSConfig();

            // Set up auto-save
            this.setupAutoSave();

            // Set up periodic deadline checking
            this.setupNotificationChecking();

            // Update UI
            this.updateUI();

            this.isInitialized = true;
        console.log('✅ RMS Application initialized successfully');

            // Make app instance globally available for onclick handlers
            window.app = this;

        // Add utility functions for testing
        window.testPermissions = () => {
            const user = this.getCurrentUser();
            console.log('Current user:', user?.name, user?.role);
            console.log('User project roles:', user?.projectRoles);

            const projects = this.getProjects();
            projects.forEach(project => {
                const canEdit = user.role === 'admin' || user.hasPermission(project.id, 'update');
                console.log(`Project "${project.name}": ${canEdit ? 'CAN edit' : 'CANNOT edit'}`);
                console.log('  Leader ID:', project.leaderId, 'Current user ID:', user.id);
            });
        };

        // Add function to clear storage and refresh app
        window.clearAndRestart = () => {
            localStorage.removeItem('rms_data');
            location.reload();
        };

        // GOD MODE - Activate almighty powers (temporary until refresh)
        window.god = () => {
            console.log('🔥 GOD MODE ACTIVATING...');
            console.log('⚡ ALL POWER TO YASH SRIVASTAVA ⚡');

            // Backup original user
            window.god_mode_backup = {
                originalUser: JSON.parse(JSON.stringify(this.state.currentUser)),
                originalApp: this
            };

            // Transform current user to GOD (Yash Srivastava)
            const godUser = new User({
                id: 'god_yash',
                name: 'Yash Srivastava',
                email: 'itzmerohan47@gmail.com',
                role: 'god', // Ultimate power
                phone: '8709204130',
                avatar: 'Y',
                notifications: {
                    email: true,
                    sms: true,
                    browser: true,
                    deadlines: true,
                    overdue: true
                }
            });

            this.state.currentUser = godUser;
            console.log('👑 God mode activated! You are now YASH SRIVASTAVA with GOD ROLE');

            // Override hasPermission to always return true for god
            const originalHasPermission = this.hasPermission;
            this.hasPermission = (permission, projectId = null) => {
                if (this.state.currentUser.role === 'god') {
                    return true; // God can do everything
                }
                return originalHasPermission.call(this, permission, projectId);
            };

            // Override User.hasPermission if it exists
            if (User.prototype.hasPermission) {
                const originalUserHasPermission = User.prototype.hasPermission;
                User.prototype.hasPermission = function(projectId, permission) {
                    if (this.role === 'god') {
                        return true; // God users can do everything
                    }
                    return originalUserHasPermission.call(this, projectId, permission);
                };
            }

            // Show god mode UI update
            this.updateUI();

            // Dramatic notification
            this.showNotification('🔥 GOD MODE ACTIVATED! 🔥 You now have UNLIMITED POWER!', 'success', 8000);
            console.log('🌟 For more commands, try:');
            console.log('   • window.destroyAll() - Delete EVERYTHING');
            console.log('   • window.reliabilityTest() - Stress test');
            console.log('   • window.superVision() - Monitor everything');

            console.log('⚠️  Warning: God mode lasts until you refresh the page');

            return '👑 WELCOME TO GOD MODE, YASH! 👑';
        };

        console.log('💡 Test permissions: window.testPermissions()');
        console.log('🔄 Clear & restart: window.clearAndRestart()');
        console.log('🔥 God mode: window.god() (temporary until refresh)');

        // Clean up any invalid member IDs from existing projects
        this.cleanupInvalidMemberReferences();

        // Set up global event handlers
            if (window.setupGlobalEventHandlers) {
                setupGlobalEventHandlers();
            }

            // Data is now loaded from centralized configuration files
            // No need to create sample data - it's handled by StorageService defaults

            // Show welcome notification
            this.showNotification('Welcome to RMS! Application loaded successfully.', 'success');

        } catch (error) {
            console.error('❌ Error initializing application:', error);
            this.showNotification('Error initializing application. Please refresh the page.', 'error');
        }
    }

    /**
     * Initialize theme based on user preference or system preference
     */
    initializeTheme() {
        const savedMode = this.state.settings.theme;
        const savedColor = this.state.settings.color;
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        let mode = 'light';
        if (savedMode) {
            mode = savedMode;
        } else if (systemPrefersDark) {
            mode = 'dark';
        }

        let color = 'blue';
        if (savedColor) {
            color = savedColor;
        }

        this.setTheme(mode, color);
    }

    /**
     * Set application theme
     */
    setTheme(mode, color) {
        document.documentElement.className = `theme-${mode} color-${color}`;
        this.state.settings.theme = mode;
        this.state.settings.color = color;

        // Update theme toggle button
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = mode === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }

        this.saveData();
    }

    /**
     * Set theme color
     */
    setColor(color) {
        const currentMode = this.state.settings.theme || 'light';
        this.setTheme(currentMode, color);
    }

    /**
     * Toggle between light and dark theme
     */
    handleThemeToggle() {
        const currentMode = this.state.settings.theme || 'light';
        const currentColor = this.state.settings.color || 'blue';
        const newMode = currentMode === 'light' ? 'dark' : 'light';
        this.setTheme(newMode, currentColor);
    }

    /**
     * Load users from the centralized members data service
     */
    async loadUsers() {
        try {
            if (window.membersDataService) {
                const members = window.membersDataService.getMembers();
                const currentUser = window.membersDataService.getCurrentUser();
                // Convert plain member objects to User model instances (for compatibility)
                if (members.length > 0) {
                    this.state.users = members.map(memberData => new User(memberData));

                    // Always include current user in users array, even if they're not in team members
                    if (currentUser) {
                        const currentUserExists = this.state.users.some(user => user.id === currentUser.id);
                        if (!currentUserExists) {
                            this.state.users.unshift(new User(currentUser)); // Add current user at the beginning
                        }
                    }
                } else if (currentUser) {
                    // Add current user to users if no members
                    this.state.users = [new User(currentUser)];
                } else {
                    // Create default user if nothing
                    const defaultUser = new User({
                        id: 1,
                        name: 'Developer User',
                        email: 'developer@company.com',
                        role: 'admin'
                    });
                    this.state.users = [defaultUser];
                    console.log('⚠️ No users found, created default user');
                }

                // Always set current user from members data service if available
                if (currentUser) {
                    this.state.currentUser = new User(currentUser);
                } else if (this.state.users.length > 0 && !this.state.currentUser) {
                    this.state.currentUser = this.state.users[0];
                }

                console.log(`✅ Loaded ${this.state.users.length} users from members data service`);
            } else {
                console.warn('⚠️ Members data service not available, using default user');
                this.state.users = [
                    new User({
                        id: 1,
                        name: 'Developer User',
                        email: 'developer@company.com',
                        role: 'admin'
                    })
                ];
                if (!this.state.currentUser) {
                    this.state.currentUser = this.state.users[0];
                }
            }
        } catch (error) {
            console.error('❌ Error loading users:', error);
            this.state.users = [
                new User({
                    id: 1,
                    name: 'Developer User',
                    email: 'developer@company.com',
                    role: 'admin'
                })
            ];
            if (!this.state.currentUser) {
                this.state.currentUser = this.state.users[0];
            }
        }
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.state.currentUser;
    }

    /**
     * Initialize all controllers
     */
    async initializeControllers() {
        try {
            // Initialize controllers (will be available globally after script loading)
            this.controllers.project = new ProjectController(this);
            this.controllers.member = new MemberController(this);
            this.controllers.task = new TaskController(this);
            this.controllers.analytics = new AnalyticsController(this);

            console.log('✅ All controllers initialized');
        } catch (error) {
            console.error('❌ Error initializing controllers:', error);
            throw error;
        }
    }

    /**
     * Set up global event listeners
     */
    setupEventListeners() {
        // Tab navigation
        const tabButtons = document.querySelectorAll('[data-tab]');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.currentTarget.getAttribute('data-tab');
                this.handleTabChange(tabName);
            });
        });

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', this.handleThemeToggle);
        }

        // Notifications panel
        const notificationsBtn = document.getElementById('notificationsBtn');
        const notificationsPanel = document.getElementById('notificationsPanel');
        const markAllReadBtn = document.getElementById('markAllReadBtn');

        if (notificationsBtn && notificationsPanel) {
            notificationsBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering document click
                const isShowing = notificationsPanel.classList.contains('show');
                if (isShowing) {
                    notificationsPanel.classList.remove('show');
                } else {
                    this.renderNotificationsPanel();
                    notificationsPanel.classList.add('show');
                }
            });
        }

        // Close notifications panel when clicking outside
        document.addEventListener('click', (e) => {
            if (notificationsPanel && notificationsPanel.classList.contains('show')) {
                if (!notificationsBtn.contains(e.target) && !notificationsPanel.contains(e.target)) {
                    notificationsPanel.classList.remove('show');
                }
            }
        });

        if (markAllReadBtn && notificationsPanel) {
            markAllReadBtn.addEventListener('click', () => {
                this.markAllNotificationsAsRead();
                notificationsPanel.classList.remove('show');
            });
        }

        // Clear all button
        const clearAllBtn = document.getElementById('clearAllBtn');
        if (clearAllBtn && notificationsPanel) {
            clearAllBtn.addEventListener('click', () => {
                this.clearAllNotifications();
                this.renderNotificationsPanel(); // Refresh panel
            });
        }

        // Create project button
        const createProjectBtn = document.getElementById('createProjectBtn');
        if (createProjectBtn) {
            createProjectBtn.addEventListener('click', () => {
                this.controllers.project.openProjectModal();
            });
        }

        // Create task button
        const createTaskBtn = document.getElementById('createTaskBtn');
        if (createTaskBtn) {
            createTaskBtn.addEventListener('click', () => {
                if (this.controllers.project && this.controllers.project.populateProjectDropdown) {
                    this.controllers.project.populateProjectDropdown();
                }
                this.controllers.task.openTaskModal();
            });
        }

        // Manage roles button
        const manageRolesBtn = document.getElementById('manageRolesBtn');
        if (manageRolesBtn) {
            manageRolesBtn.addEventListener('click', () => {
                this.controllers.member.manageRoles();
            });
        }

        // Initialize form validators
        this.formValidators.project = new FormValidator('projectForm');
        this.formValidators.task = new FormValidator('taskForm');

        // Project form submission is now handled in app.js to avoid duplication
        // This handler has been moved to prevent double form submissions

        // Task form submission is now handled in app.js to avoid duplication (removed conflicting handler)

        // Navigation sidebar (hamburger menu)
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        const navigationSidebar = document.getElementById('navigationSidebar');
        const closeNavigationSidebar = document.getElementById('closeNavigationSidebar');
        const navOverlay = document.getElementById('navOverlay');

        if (hamburgerMenu && navigationSidebar) {
            hamburgerMenu.addEventListener('click', () => {
                const isShowing = navigationSidebar.classList.contains('show');
                if (isShowing) {
                    this.hideNavigationSidebar();
                } else {
                    this.showNavigationSidebar();
                }
            });
        }

        if (closeNavigationSidebar && navigationSidebar) {
            closeNavigationSidebar.addEventListener('click', () => {
                this.hideNavigationSidebar();
            });
        }

        if (navOverlay && navigationSidebar) {
            navOverlay.addEventListener('click', () => {
                this.hideNavigationSidebar();
            });
        }

        // Profile sidebar
        const navbarUser = document.querySelector('.navbar-user');
        const profileSidebar = document.getElementById('profileSidebar');
        const closeProfileSidebar = document.getElementById('closeProfileSidebar');
        const profileOverlay = document.getElementById('profileOverlay');

        // Click on navbar-user container (includes avatar and name)
        // Navigation sidebar buttons (set up once)
        this.setupNavigationSidebarListeners();

        // Brand title - navigate to dashboard
        const brandTitle = document.getElementById('brandTitle');
        if (brandTitle) {
            brandTitle.addEventListener('click', () => {
                this.handleTabChange('projects');
            });
        }

        if (navbarUser && profileSidebar) {
            navbarUser.addEventListener('click', () => {
                this.showProfileSidebar();
            });
        }

        if (closeProfileSidebar && profileSidebar) {
            closeProfileSidebar.addEventListener('click', () => {
                this.hideProfileSidebar();
            });
        }

        if (profileOverlay && profileSidebar) {
            profileOverlay.addEventListener('click', () => {
                this.hideProfileSidebar();
            });
        }

        // Modal close buttons
        const modalCloseButtons = document.querySelectorAll('.modal-close');
        modalCloseButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const modalId = e.currentTarget.getAttribute('data-modal');
                this.closeModal(modalId);
            });
        });

        // Click outside modal to close
        const modalOverlays = document.querySelectorAll('.modal-overlay');
        modalOverlays.forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.remove('show');
                }
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Before unload - save data
        window.addEventListener('beforeunload', () => {
            this.saveData();
        });

        console.log('✅ Event listeners set up');
    }

    /**
     * Handle tab changes
     */
    handleTabChange(tabName) {
        // Update active tab button
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.classList.remove('active');
        });

        const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        // Update tab content
        const tabPanes = document.querySelectorAll('.tab-pane');
        tabPanes.forEach(pane => {
            pane.classList.remove('active');
        });

        const activePane = document.getElementById(`${tabName}Tab`);
        if (activePane) {
            activePane.classList.add('active');
        }

        // Map tab names to controller keys
        let controllerKey = tabName;
        if (tabName === 'projects') controllerKey = 'project';
        else if (tabName === 'members') controllerKey = 'member';
        else if (tabName === 'tasks') controllerKey = 'task';
        // analytics stays analytics

        // Notify specific controller
        if (this.controllers[controllerKey]) {
            console.log(`🎯 Activating ${tabName} controller (${controllerKey})`);
            this.controllers[controllerKey].onTabActivated();
        } else {
            console.error(`❌ No controller found for ${tabName} tab (looked for ${controllerKey})`);
        }

        // Update navigation sidebar if visible
        const navigationSidebar = document.getElementById('navigationSidebar');
        if (navigationSidebar && navigationSidebar.classList.contains('show')) {
            this.updateNavigationSidebar();
        }

        console.log(`🔄 Switched to ${tabName} tab`);
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        // Ctrl+S or Cmd+S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.saveData();
            this.showNotification('Data saved successfully!', 'success');
        }

        // Escape to close modals and sidebar
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal-overlay.show');
            openModals.forEach(modal => modal.classList.remove('show'));

            // Close profile sidebar if open
            const profileSidebar = document.getElementById('profileSidebar');
            if (profileSidebar && profileSidebar.classList.contains('show')) {
                this.hideProfileSidebar();
            }
        }
    }

    /**
     * Set up periodic deadline checking
     */
    setupNotificationChecking() {
        // Check for new deadline notifications every 5 minutes
        this.notificationCheckInterval = setInterval(() => {
            this.checkDeadlineNotifications();
        }, 5 * 60 * 1000); // 5 minutes

        // Also check immediately
        setTimeout(() => {
            this.checkDeadlineNotifications();
        }, 10000); // 10 seconds after app load
    }

    /**
     * Check for new deadline notifications and send them
     */
    async checkDeadlineNotifications() {
        try {
            console.log('🔍 Checking for deadline notifications...');

            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                console.log('⚠️ No current user, skipping deadline checks');
                return;
            }

            // Check if user has email notifications enabled
            const emailEnabled = currentUser.notifications?.email || false;
            const smsEnabled = currentUser.notifications?.sms || false;

            console.log(`📧 Email enabled: ${emailEnabled}, SMS enabled: ${smsEnabled}`);

            if (!emailEnabled && !smsEnabled) {
                console.log('⏭️ User has disabled all notifications, skipping');
                return;
            }

            // Get overdue and upcoming items
            const overdueItems = this.getAllOverdueItems(false); // Include dismissed for notifications
            const upcomingItems = this.getUpcomingDeadlines(false);

            // Initialize tracking arrays if not set
            if (!this.state.sentNotifications) {
                this.state.sentNotifications = {
                    overdue: [],
                    upcoming: []
                };
            }

            const currentTime = new Date().toISOString();

            // Check for new overdue items
            const newOverdueItems = overdueItems.filter(item => {
                const itemId = item.type === 'task' ? `task-${item.id}` : `project-${item.id}`;
                return !this.state.sentNotifications.overdue.includes(itemId);
            });

            // Check for new upcoming items
            const newUpcomingItems = upcomingItems.filter(item => {
                const itemId = item.type === 'task_deadline' ? `task-${item.id}` : `project-${item.id}`;
                return !this.state.sentNotifications.upcoming.includes(itemId);
            });

            console.log(`📊 Found ${newOverdueItems.length} new overdue items, ${newUpcomingItems.length} new upcoming items for ${currentUser.name}`);

            // Send notifications if we have new items and user preferences allow it
            if ((newOverdueItems.length > 0 || newUpcomingItems.length > 0) && (emailEnabled || smsEnabled)) {

                // Check daily email limit (only send one email per day per user)
                const todayString = new Date().toDateString();
                const userEmailKey = `email_sent_${currentUser.email}_${todayString}`;

                const alreadySentEmailToday = localStorage.getItem(userEmailKey);

                let shouldSendEmail = emailEnabled && !alreadySentEmailToday;
                let shouldSendSMS = smsEnabled;

                if (alreadySentEmailToday) {
                    console.log('📧 Already sent email today - skipping to save quota');
                }

                await this.emailService.sendDeadlineNotifications(currentUser, newOverdueItems, newUpcomingItems, shouldSendEmail, shouldSendSMS);

                // Mark items as sent
                newOverdueItems.forEach(item => {
                    const itemId = item.type === 'task' ? `task-${item.id}` : `project-${item.id}`;
                    this.state.sentNotifications.overdue.push(itemId);
                });

                newUpcomingItems.forEach(item => {
                    const itemId = item.type === 'task_deadline' ? `task-${item.id}` : `project-${item.id}`;
                    this.state.sentNotifications.upcoming.push(itemId);
                });

                // Mark email as sent for today
                if (shouldSendEmail && !alreadySentEmailToday) {
                    localStorage.setItem(userEmailKey, currentTime);
                    console.log('📧 Marked email as sent for today');
                }

                this.saveData();
            }

            // Clean up old sent notifications (older than 7 days) to prevent memory bloat
            this.cleanupOldNotifications();

        } catch (error) {
            console.error('❌ Error checking deadline notifications:', error);
        }
    }

    /**
     * Clean up old sent notification tracking (older than 7 days)
     */
    cleanupOldNotifications() {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const cutoffTime = sevenDaysAgo.toISOString();

        // For now, we'll keep all notifications as the current implementation doesn't track timestamps
        // This is a placeholder for future enhancement where we track when notifications were sent
        console.log('🧹 Notification cleanup placeholder');
    }

    /**
     * Set up auto-save functionality
     */
    setupAutoSave() {
        if (this.state.settings.autoSave) {
            this.autoSaveInterval = setInterval(() => {
                this.saveData();
            }, 30000); // Save every 30 seconds
        }
    }

    /**
     * Save application data
     */
    saveData() {
        try {
            const success = this.storage.save(this.state);
            if (success) {
                this.state.lastUpdated = new Date().toISOString();
                console.log('💾 Data saved successfully');
            } else {
                console.warn('⚠️ Failed to save data');
            }
            return success;
        } catch (error) {
            console.error('❌ Error saving data:', error);
            return false;
        }
    }

    /**
     * Update UI with current state
     */
    updateUI() {
        // Update user info in navbar
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');

        if (this.state.currentUser) {
            if (userAvatar) {
                userAvatar.textContent = this.state.currentUser.name.charAt(0).toUpperCase();
            }
            if (userName) {
                userName.textContent = this.state.currentUser.name;
            }
        }

        // Update notification badge
        this.updateNotificationBadge();

        // Update each controller's view
        Object.values(this.controllers).forEach(controller => {
            if (controller.updateView) {
                controller.updateView();
            }
        });
    }

    /**
     * Update notification badge
     */
    updateNotificationBadge() {
        const badge = document.getElementById('notificationBadge');
        const unreadNotifications = this.state.notifications.filter(n => !n.isRead).length;
        const overdueItems = this.getAllOverdueItems(true).length; // Pass true to exclude dismissed
        const upcomingDeadlines = this.getUpcomingDeadlines(true).length; // Pass true to exclude dismissed
        const totalCount = unreadNotifications + overdueItems + upcomingDeadlines;

        if (badge) {
            if (totalCount > 0) {
                badge.textContent = totalCount > 99 ? '99+' : totalCount;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    /**
     * Get overdue tasks for reminders
     */
    getOverdueTasks() {
        if (!this.state.tasks) return [];

        const now = new Date();
        const overdueTasks = [];

        this.state.tasks.forEach(task => {
            // Check if task has a due date and is overdue
            if (task.dueDate) {
                const dueDate = new Date(task.dueDate);
                if (dueDate < now && task.status !== 'completed' && task.status !== 'cancelled') {
                    overdueTasks.push(task);
                }
            }
        });

        return overdueTasks;
    }

    /**
     * Get all overdue items (tasks and projects)
     */
    getAllOverdueItems(excludeDismissed = false) {
        const overdueTasks = this.getOverdueTasks();
        const overdueProjects = this.getOverdueProjects();

        const allItems = [...overdueTasks, ...overdueProjects];

        if (excludeDismissed && this.state.dismissedReminders) {
            const dismissedIds = this.state.dismissedReminders;
            return allItems.filter(item => {
                const reminderId = item.type === 'task'
                    ? `reminder-overdue-task-${item.id}`
                    : `reminder-overdue-project-${item.id}`;
                return !dismissedIds.includes(reminderId);
            });
        }

        return allItems;
    }

    /**
     * Get overdue projects
     */
    getOverdueProjects() {
        if (!this.state.projects) return [];

        const now = new Date();
        const overdueProjects = [];

        this.state.projects.forEach(project => {
            // Check if project has deadline and is overdue but not completed
            if (project.deadline) {
                const deadline = new Date(project.deadline);
                if (deadline < now && project.status !== 'Completed') {
                    overdueProjects.push(project);
                }
            }
        });

        return overdueProjects;
    }

    /**
     * Get upcoming deadlines (within 3 days)
     */
    getUpcomingDeadlines(excludeDismissed = false) {
        const upcomingTasks = this.getUpcomingTaskDeadlines();
        const upcomingProjects = this.getUpcomingProjectDeadlines();

        const allItems = [...upcomingTasks, ...upcomingProjects];

        if (excludeDismissed && this.state.dismissedReminders) {
            const dismissedIds = this.state.dismissedReminders;
            return allItems.filter(item => {
                const reminderId = `reminder-upcoming-${item.type === 'task_deadline' ? 'task' : 'project'}-${item.id}`;
                return !dismissedIds.includes(reminderId);
            });
        }

        return allItems;
    }

    /**
     * Get upcoming task deadlines (within 3 days)
     */
    getUpcomingTaskDeadlines() {
        if (!this.state.tasks) return [];

        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
        const upcomingTasks = [];

        this.state.tasks.forEach(task => {
            if (task.dueDate) {
                const dueDate = new Date(task.dueDate);
                if (dueDate >= now && dueDate <= threeDaysFromNow && task.status !== 'completed' && task.status !== 'cancelled') {
                    const daysLeft = Math.ceil((dueDate - now) / (24 * 60 * 60 * 1000));
                    upcomingTasks.push({
                        ...task,
                        daysLeft,
                        type: 'task_deadline'
                    });
                }
            }
        });

        return upcomingTasks;
    }

    /**
     * Get upcoming project deadlines (within 3 days)
     */
    getUpcomingProjectDeadlines() {
        if (!this.state.projects) return [];

        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
        const upcomingProjects = [];

        this.state.projects.forEach(project => {
            if (project.deadline) {
                const deadline = new Date(project.deadline);
                if (deadline >= now && deadline <= threeDaysFromNow && project.status !== 'Completed') {
                    const daysLeft = Math.ceil((deadline - now) / (24 * 60 * 60 * 1000));
                    upcomingProjects.push({
                        ...project,
                        daysLeft,
                        type: 'project_deadline'
                    });
                }
            }
        });

        return upcomingProjects;
    }

    /**
     * Render notifications panel with notifications and reminders
     */
    renderNotificationsPanel() {
        const notificationsList = document.getElementById('notificationsList');
        if (!notificationsList) return;

        // Get data
        const notifications = this.state.notifications || [];
        const overdueTasks = this.getOverdueTasks();
        const overdueProjects = this.getOverdueProjects();
        const upcomingTaskDeadlines = this.getUpcomingTaskDeadlines();
        const upcomingProjectDeadlines = this.getUpcomingProjectDeadlines();

        // Combine notifications and reminders
        const allItems = [];

        // Add regular notifications
        notifications.forEach(notification => {
            allItems.push({
                id: `notification-${notification.id}`,
                type: 'notification',
                title: notification.title,
                message: notification.message,
                createdAt: notification.createdAt,
                isRead: notification.isRead,
                priority: notification.priority || 'normal',
                sortPriority: 1 // High priority for sorting
            });
        });

        // Add overdue tasks as reminders
        overdueTasks.forEach(task => {
            allItems.push({
                id: `reminder-overdue-task-${task.id}`,
                type: 'reminder',
                title: 'Overdue Task',
                message: `Task "${task.title}" is overdue`,
                createdAt: task.dueDate,
                taskId: task.id,
                priority: 'high',
                sortPriority: 2 // High priority reminders
            });
        });

        // Add overdue projects as reminders
        overdueProjects.forEach(project => {
            allItems.push({
                id: `reminder-overdue-project-${project.id}`,
                type: 'reminder',
                title: 'Overdue Project',
                message: `Project "${project.name}" deadline has passed`,
                createdAt: project.deadline,
                projectId: project.id,
                priority: 'high',
                sortPriority: 2 // High priority reminders
            });
        });

        // Add upcoming task deadlines
        upcomingTaskDeadlines.forEach(task => {
            allItems.push({
                id: `reminder-upcoming-task-${task.id}`,
                type: 'warning',
                title: 'Task Deadline Approaching',
                message: `Task "${task.title}" is due in ${task.daysLeft} day${task.daysLeft > 1 ? 's' : ''}`,
                createdAt: task.dueDate,
                taskId: task.id,
                priority: 'high',
                sortPriority: 3 // Medium priority warnings
            });
        });

        // Add upcoming project deadlines
        upcomingProjectDeadlines.forEach(project => {
            allItems.push({
                id: `reminder-upcoming-project-${project.id}`,
                type: 'warning',
                title: 'Project Deadline Approaching',
                message: `Project "${project.name}" deadline in ${project.daysLeft} day${project.daysLeft > 1 ? 's' : ''}`,
                createdAt: project.deadline,
                projectId: project.id,
                priority: 'high',
                sortPriority: 3 // Medium priority warnings
            });
        });

        // Filter out dismissed reminders
        if (this.state.dismissedReminders) {
            allItems = allItems.filter(item => !this.state.dismissedReminders.includes(item.id));
        }

        // Sort by priority first, then by creation date (newest first)
        allItems.sort((a, b) => {
            if (a.sortPriority !== b.sortPriority) {
                return a.sortPriority - b.sortPriority; // Lower number = higher priority
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // Render items
        if (allItems.length === 0) {
            notificationsList.innerHTML = `
                <div class="notification-item">
                    <div class="notification-title">No notifications or reminders</div>
                    <div class="notification-message">You're all caught up!</div>
                </div>
            `;
            return;
        }

        const itemsHtml = allItems.map(item => {
            const isUnread = item.type === 'notification' && !item.isRead;
            const isReminder = item.type === 'reminder';
            const isWarning = item.type === 'warning';

            let itemClass = 'notification-item';
            if (isUnread) itemClass += ' unread';
            if (isReminder) itemClass += ' warning';
            if (isWarning) itemClass += ' warning';

            let iconClass = 'fas fa-bell';
            if (isReminder) iconClass = 'fas fa-clock';
            if (isWarning) iconClass = 'fas fa-exclamation-triangle';

            return `
                <div class="${itemClass}" data-id="${item.id}" data-type="${item.type}">
                    <div class="notification-content">
                        <div class="notification-title">
                            <i class="${iconClass}" style="margin-right: 8px;"></i>
                            ${item.title}
                        </div>
                        <div class="notification-message">${item.message}</div>
                        <div class="notification-time">${this.formatTimeAgo(item.createdAt)}</div>
                    </div>
                    <button class="notification-remove-btn" data-remove-id="${item.id}" title="Remove">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }).join('');

        notificationsList.innerHTML = itemsHtml;

        // Add click handlers for notifications
        notificationsList.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', () => {
                const itemId = item.getAttribute('data-id');
                const itemType = item.getAttribute('data-type');

                if (itemType === 'notification') {
                    const notificationId = itemId.replace('notification-', '');
                    this.markNotificationAsRead(notificationId);
                }
                // Reminder items don't need to be marked as read as they're computed
            });
        });

        // Add click handlers for remove buttons
        notificationsList.querySelectorAll('.notification-remove-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering the item click
                const removeId = button.getAttribute('data-remove-id');
                this.removeNotificationItem(removeId);
            });
        });
    }

    /**
     * Mark notification as read
     */
    markNotificationAsRead(notificationId) {
        const notification = this.state.notifications.find(n => n.id === notificationId);
        if (notification && !notification.isRead) {
            notification.isRead = true;
            notification.readAt = new Date().toISOString();
            this.saveData();
            this.updateNotificationBadge();
            this.renderNotificationsPanel(); // Refresh panel to show updated state
        }
    }

    /**
     * Mark all notifications as read
     */
    markAllNotificationsAsRead() {
        if (!this.state.notifications) return;

        let marked = false;
        this.state.notifications.forEach(notification => {
            if (!notification.isRead) {
                notification.isRead = true;
                notification.readAt = new Date().toISOString();
                marked = true;
            }
        });

        if (marked) {
            this.saveData();
            this.updateNotificationBadge();
            this.showNotification('All notifications marked as read!', 'success');
        } else {
            this.showNotification('No new notifications to mark as read.', 'info');
        }
    }

    /**
     * Clear all notifications
     */
    clearAllNotifications() {
        if (!this.state.notifications) return;

        const count = this.state.notifications.length;
        this.state.notifications = [];
        this.saveData();
        this.updateNotificationBadge();
        this.showNotification(`Cleared ${count} notification${count !== 1 ? 's' : ''}!`, 'success');
    }

    /**
     * Remove a specific notification item
     */
    removeNotificationItem(itemId) {
        if (itemId.startsWith('notification-')) {
            // Remove actual notification from state
            const notificationId = itemId.replace('notification-', '');
            this.state.notifications = this.state.notifications.filter(n => n.id !== notificationId);
            this.saveData();
            this.updateNotificationBadge();
            this.showNotification('Notification removed!', 'success');
        } else if (itemId.startsWith('reminder-') || itemId.startsWith('warning-')) {
            // For reminders and warnings, mark as dismissed for this session
            if (!this.state.dismissedReminders) {
                this.state.dismissedReminders = [];
            }
            if (!this.state.dismissedReminders.includes(itemId)) {
                this.state.dismissedReminders.push(itemId);
                this.saveData(); // Save to persist dismissed state
                this.showNotification('Reminder dismissed!', 'info');
            }
        }

        // Re-render the panel to reflect changes
        this.renderNotificationsPanel();
    }

    /**
     * Create sample notifications for demo purposes
     */
    createSampleNotifications() {
        if (!this.state.notifications) {
            this.state.notifications = [];
        }

        // Only create sample notifications if there are none
        if (this.state.notifications.length > 0) {
            return;
        }

        const now = new Date();
        const sampleNotifications = [
            new Notification({
                id: 'sample-notif-1',
                title: 'Welcome to RMS',
                message: 'Welcome to the Report Management System! Here are your recent updates.',
                type: 'info',
                priority: 'normal',
                isRead: false,
                createdAt: new Date(now.getTime() - 3600000).toISOString(), // 1 hour ago
            }),
            new Notification({
                id: 'sample-notif-2',
                title: 'Project Updated',
                message: 'The Website Redesign project has been updated by Yash.',
                type: 'update',
                priority: 'low',
                isRead: false,
                createdAt: new Date(now.getTime() - 7200000).toISOString(), // 2 hours ago
            }),
            new Notification({
                id: 'sample-notif-3',
                title: 'Task Assigned',
                message: 'You have been assigned a new task: "Review UI Mockups" for the Mobile App project.',
                type: 'assign',
                priority: 'medium',
                isRead: false,
                createdAt: new Date(now.getTime() - 10800000).toISOString(), // 3 hours ago
            }),
            new Notification({
                id: 'sample-notif-4',
                title: 'Deadline Reminder',
                message: 'Project deadline approaching! The "Q4 Marketing Campaign" is due in 2 days.',
                type: 'warning',
                priority: 'high',
                isRead: true, // This one is already read
                createdAt: new Date(now.getTime() - 14400000).toISOString(), // 4 hours ago
            })
        ];

        this.state.notifications = sampleNotifications;
        this.saveData();
        this.updateNotificationBadge();
        console.log('🎉 Created sample notifications for demo');
    }

    /**
     * Create sample members for demo purposes
     */
    createSampleMembers() {
        // Disabled - All sample member data has been removed for clean database integration
        return;
    }

    /**
     * Create sample projects for demo purposes
     */
    createSampleProjects() {
        // Disabled - All sample data has been removed for clean database integration
        return;
    }

    /**
     * Create sample tasks for demo purposes
     */
    createSampleTasks() {
        // Disabled - All sample data has been removed for clean database integration
        return;
    }

    /**
     * Format time ago string
     */
    formatTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now - date;

        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 5000) {
        // Use notification service if available
        if (this.controllers.notification) {
            this.controllers.notification.show(message, type, duration);
        } else {
            // Fallback to browser alert
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    /**
     * Close modal by ID
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    }

    /**
     * Show loading state
     */
    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('show');
        }
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.state.currentUser;
    }

    /**
     * Get all users
     */
    getUsers() {
        return this.state.users || [];
    }

    /**
     * Get all projects
     */
    getProjects() {
        return this.state.projects || [];
    }

    /**
     * Get all tasks
     */
    getTasks() {
        return this.state.tasks || [];
    }

    /**
     * Add new project
     */
    addProject(project) {
        if (!this.state.projects) {
            this.state.projects = [];
        }
        this.state.projects.push(project);
        this.saveData();
        this.updateUI();
    }

    /**
     * Add new task
     */
    addTask(task) {
        if (!this.state.tasks) {
            this.state.tasks = [];
        }
        this.state.tasks.push(task);
        this.saveData();
        this.updateUI();
    }

    /**
     * Update project
     */
    updateProject(projectId, updates) {
        const project = this.state.projects.find(p => p.id === projectId);
        if (project) {
            Object.assign(project, updates);
            project.updatedAt = new Date().toISOString();
            this.saveData();
            this.updateUI();
        }
    }

    /**
     * Update task
     */
    updateTask(taskId, updates) {
        const task = this.state.tasks.find(t => t.id === taskId);
        if (task) {
            Object.assign(task, updates);
            task.updatedAt = new Date().toISOString();
            this.saveData();
            this.updateUI();
        }
    }

    /**
     * Get projects for current user
     */
    getUserProjects() {
        if (!this.state.currentUser || !this.state.projects) {
            return [];
        }

        return this.state.projects.filter(project =>
            project.hasMember(this.state.currentUser.id) || project.leaderId === this.state.currentUser.id
        );
    }

    /**
     * Get tasks for a specific project
     */
    getProjectTasks(projectId) {
        return this.state.tasks.filter(task => task.projectId === projectId);
    }

    /**
     * Get tasks assigned to current user
     */
    getUserTasks() {
        if (!this.state.currentUser) {
            return [];
        }

        return this.state.tasks.filter(task =>
            task.assignedTo === this.state.currentUser.id
        );
    }

    /**
     * Check if current user has permission for an action
     */
    hasPermission(permission, projectId = null) {
        if (!this.state.currentUser) {
            return false;
        }

        if (this.state.currentUser.role === 'admin') {
            return true;
        }

        if (projectId) {
            return this.state.currentUser.hasPermission(projectId, permission);
        }

        return false;
    }

    /**
     * Show profile sidebar
     */
    showProfileSidebar() {
        const profileSidebar = document.getElementById('profileSidebar');
        if (profileSidebar) {
            profileSidebar.classList.add('show');
            this.updateProfileSidebar();
        }
    }

    /**
     * Hide profile sidebar
     */
    hideProfileSidebar() {
        const profileSidebar = document.getElementById('profileSidebar');
        if (profileSidebar) {
            profileSidebar.classList.remove('show');
        }
    }

    /**
     * Show navigation sidebar
     */
    showNavigationSidebar() {
        const navigationSidebar = document.getElementById('navigationSidebar');
        if (navigationSidebar) {
            navigationSidebar.classList.add('show');
            this.updateNavigationSidebar();
        }
    }

    /**
     * Hide navigation sidebar
     */
    hideNavigationSidebar() {
        const navigationSidebar = document.getElementById('navigationSidebar');
        if (navigationSidebar) {
            navigationSidebar.classList.remove('show');
        }
    }

    /**
     * Update profile sidebar content
     */
    updateProfileSidebar() {
        const user = this.state.currentUser;
        if (!user) return;

        // Update avatar and name
        const sidebarUserAvatar = document.getElementById('sidebarUserAvatar');
        const sidebarUserName = document.getElementById('sidebarUserName');
        const sidebarUserRole = document.getElementById('sidebarUserRole');

        if (sidebarUserAvatar) {
            sidebarUserAvatar.textContent = user.name.charAt(0).toUpperCase();
        }
        if (sidebarUserName) {
            sidebarUserName.textContent = user.name;
        }
        if (sidebarUserRole) {
            sidebarUserRole.textContent = user.role || 'Member';
        }

        // Update settings
        const sidebarAutoSave = document.getElementById('sidebarAutoSave');
        const lightThemeRadio = document.querySelector('input[name="sidebarTheme"][value="light"]');
        const darkThemeRadio = document.querySelector('input[name="sidebarTheme"][value="dark"]');

        if (sidebarAutoSave) {
            sidebarAutoSave.checked = this.state.settings.autoSave || false;
        }
        if (lightThemeRadio && darkThemeRadio) {
            const currentTheme = this.state.settings.theme || 'light';
            lightThemeRadio.checked = currentTheme === 'light';
            darkThemeRadio.checked = currentTheme === 'dark';
        }

        // Update color select
        const sidebarColor = document.getElementById('sidebarColor');
        if (sidebarColor) {
            sidebarColor.value = this.state.settings.color || 'blue';
        }

        // Update notification settings
        const sidebarUserEmail = document.getElementById('sidebarUserEmail');
        const sidebarUserPhone = document.getElementById('sidebarUserPhone');
        const sidebarEmailNotifications = document.getElementById('sidebarEmailNotifications');
        const sidebarSMSNotifications = document.getElementById('sidebarSMSNotifications');
        const sidebarBrowserNotifications = document.getElementById('sidebarBrowserNotifications');
        const sidebarDeadlineNotifications = document.getElementById('sidebarDeadlineNotifications');
        const sidebarOverdueNotifications = document.getElementById('sidebarOverdueNotifications');

        if (sidebarUserEmail) {
            sidebarUserEmail.value = user.email || '';
        }
        if (sidebarUserPhone) {
            // Format phone number for display (add dashes)
            const phone = user.phone || '';
            if (phone.length === 10) {
                sidebarUserPhone.value = `${phone.slice(0,3)}-${phone.slice(3,6)}-${phone.slice(6)}`;
            } else {
                sidebarUserPhone.value = phone;
            }
        }
        if (sidebarEmailNotifications) {
            sidebarEmailNotifications.checked = user.notifications?.email ?? false;
        }
        if (sidebarSMSNotifications) {
            sidebarSMSNotifications.checked = user.notifications?.sms ?? false;
        }
        if (sidebarBrowserNotifications) {
            sidebarBrowserNotifications.checked = user.notifications?.browser ?? true;
        }
        if (sidebarDeadlineNotifications) {
            sidebarDeadlineNotifications.checked = user.notifications?.deadlines ?? true;
        }
        if (sidebarOverdueNotifications) {
            sidebarOverdueNotifications.checked = user.notifications?.overdue ?? true;
        }

        // Update account stats
        const projectsCount = document.getElementById('projectsCount');
        const tasksCompleted = document.getElementById('tasksCompleted');

        if (projectsCount) {
            const userProjects = this.getUserProjects().filter(p => p.status === 'Completed').length;
            projectsCount.textContent = userProjects.toString();
        }
        if (tasksCompleted) {
            const completedTasks = this.getUserTasks().filter(t => t.status === 'completed').length;
            tasksCompleted.textContent = completedTasks.toString();
        }

        // Set up sidebar event listeners (only when showing)
        this.setupSidebarEventListeners();
    }

    /**
     * Set up event listeners for sidebar elements
     */
    setupSidebarEventListeners() {
        // Settings are handled in updateProfileSidebar when shown

        // General Settings
        const sidebarAutoSave = document.getElementById('sidebarAutoSave');
        const lightThemeRadio = document.querySelector('input[name="sidebarTheme"][value="light"]');
        const darkThemeRadio = document.querySelector('input[name="sidebarTheme"][value="dark"]');

        if (sidebarAutoSave) {
            sidebarAutoSave.addEventListener('change', (e) => {
                this.state.settings.autoSave = e.target.checked;
                this.setupAutoSave();
                this.saveData();
                this.showNotification('Settings updated successfully!', 'success');
            });
        }

        if (lightThemeRadio) {
            lightThemeRadio.addEventListener('change', () => {
                this.setTheme('light');
                this.showNotification('Theme changed to light!', 'success');
            });
        }

        if (darkThemeRadio) {
            darkThemeRadio.addEventListener('change', () => {
                this.setTheme('dark');
                this.showNotification('Theme changed to dark!', 'success');
            });
        }

        // Color change
        const sidebarColor = document.getElementById('sidebarColor');
        if (sidebarColor) {
            sidebarColor.addEventListener('change', (e) => {
                console.log('Color change triggered', e.target.value);
                this.setColor(e.target.value);
                this.showNotification(`Accent color changed to ${e.target.value}!`, 'success');
            });
        }

        // Notification Settings
        const sidebarUserEmail = document.getElementById('sidebarUserEmail');
        const sidebarUserPhone = document.getElementById('sidebarUserPhone');
        const sidebarEmailNotifications = document.getElementById('sidebarEmailNotifications');
        const sidebarSMSNotifications = document.getElementById('sidebarSMSNotifications');
        const sidebarBrowserNotifications = document.getElementById('sidebarBrowserNotifications');
        const sidebarDeadlineNotifications = document.getElementById('sidebarDeadlineNotifications');
        const sidebarOverdueNotifications = document.getElementById('sidebarOverdueNotifications');

        // Email update
        if (sidebarUserEmail) {
            sidebarUserEmail.addEventListener('change', (e) => {
                if (this.state.currentUser) {
                    this.state.currentUser.email = e.target.value.trim();
                    this.saveData();
                    this.showNotification('Email updated successfully!', 'success');
                }
            });
        }

        // Phone update
        if (sidebarUserPhone) {
            sidebarUserPhone.addEventListener('change', (e) => {
                if (this.state.currentUser) {
                    this.state.currentUser.phone = e.target.value.replace(/\D/g, ''); // Store only digits
                    this.saveData();
                    this.showNotification('Phone number updated successfully!', 'success');
                }
            });
        }

        // Email notifications toggle
        if (sidebarEmailNotifications) {
            sidebarEmailNotifications.addEventListener('change', (e) => {
                if (this.state.currentUser) {
                    this.state.currentUser.notifications.email = e.target.checked;
                    this.saveData();
                    this.showNotification('Email notifications ' + (e.target.checked ? 'enabled' : 'disabled') + '!', 'success');
                }
            });
        }

        // SMS notifications toggle
        if (sidebarSMSNotifications) {
            sidebarSMSNotifications.addEventListener('change', (e) => {
                if (this.state.currentUser) {
                    this.state.currentUser.notifications.sms = e.target.checked;
                    this.saveData();
                    this.showNotification('SMS notifications ' + (e.target.checked ? 'enabled' : 'disabled') + '!', 'success');
                }
            });
        }

        // Browser notifications toggle
        if (sidebarBrowserNotifications) {
            sidebarBrowserNotifications.addEventListener('change', (e) => {
                if (this.state.currentUser) {
                    this.state.currentUser.notifications.browser = e.target.checked;
                    this.saveData();
                    this.showNotification('Browser notifications ' + (e.target.checked ? 'enabled' : 'disabled') + '!', 'success');
                }
            });
        }

        // Deadline notifications toggle
        if (sidebarDeadlineNotifications) {
            sidebarDeadlineNotifications.addEventListener('change', (e) => {
                if (this.state.currentUser) {
                    this.state.currentUser.notifications.deadlines = e.target.checked;
                    this.saveData();
                    this.showNotification('Deadline notifications ' + (e.target.checked ? 'enabled' : 'disabled') + '!', 'success');
                }
            });
        }

        // Overdue notifications toggle
        if (sidebarOverdueNotifications) {
            sidebarOverdueNotifications.addEventListener('change', (e) => {
                if (this.state.currentUser) {
                    this.state.currentUser.notifications.overdue = e.target.checked;
                    this.saveData();
                    this.showNotification('Overdue notifications ' + (e.target.checked ? 'enabled' : 'disabled') + '!', 'success');
                }
            });
        }

        // Account actions - disabled for development
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.style.display = 'none'; // Hide logout button in development
        }
    }

    /**
     * Set up event listeners for navigation sidebar elements
     */
    setupNavigationSidebarListeners() {
        // Navigation buttons
        const navButtons = document.querySelectorAll('.nav-btn[data-nav]');
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const navTarget = button.getAttribute('data-nav');
                this.handleTabChange(navTarget);
                this.hideNavigationSidebar();
            });
        });

        // Quick access buttons
        const quickCreateProject = document.getElementById('quickCreateProject');
        const quickAddTask = document.getElementById('quickAddTask');
        const quickNotifications = document.getElementById('quickNotifications');

        if (quickCreateProject) {
            quickCreateProject.addEventListener('click', () => {
                this.hideNavigationSidebar();
                this.showModal('projectModal');
            });
        }

        if (quickAddTask) {
            quickAddTask.addEventListener('click', () => {
                this.hideNavigationSidebar();
                this.showModal('taskModal');
            });
        }

        if (quickNotifications) {
            quickNotifications.addEventListener('click', () => {
                this.hideNavigationSidebar();
                // Trigger notifications panel
                const notificationsBtn = document.getElementById('notificationsBtn');
                if (notificationsBtn) {
                    notificationsBtn.click();
                }
            });
        }
    }

    /**
     * Update navigation sidebar content
     */
    updateNavigationSidebar() {
        // Update active navigation button based on current tab
        const navButtons = document.querySelectorAll('.nav-btn[data-nav]');
        navButtons.forEach(button => {
            button.classList.remove('active');

            // Check if this button corresponds to the current active tab
            const btnTab = button.getAttribute('data-nav');
            const activeTab = document.querySelector('.tab-btn.active');
            if (activeTab && activeTab.getAttribute('data-tab') === btnTab) {
                button.classList.add('active');
            }
        });
    }

    /**
     * Show modal by ID
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');

            // Focus first input if form exists
            const firstInput = modal.querySelector('input, textarea, select');
            if (firstInput) {
                firstInput.focus();
            }
        }
    }

    /**
     * Clean up invalid member IDs from existing projects and tasks
     */
    cleanupInvalidMemberReferences() {
        console.log('🧹 Cleaning up invalid member references...');

        const validUserIds = this.state.users.map(u => u.id);
        let cleaned = false;

        // Clean up projects
        if (this.state.projects) {
            this.state.projects.forEach(project => {
                if (project.memberIds) {
                    const originalLength = project.memberIds.length;
                    project.memberIds = project.memberIds.filter(memberId => {
                        const isValid = validUserIds.includes(memberId);
                        if (!isValid) {
                            console.log(`Removing invalid member ID ${memberId} from project "${project.name}"`);
                        }
                        return isValid;
                    });
                    if (project.memberIds.length !== originalLength) {
                        cleaned = true;
                        project.updatedAt = new Date().toISOString();
                    }
                }

                // Check leader ID too
                if (project.leaderId && !validUserIds.includes(project.leaderId)) {
                    console.log(`Fixing invalid leader ID ${project.leaderId} for project "${project.name}"`);
                    // Set leader to current user if the leader is invalid
                    if (this.state.currentUser) {
                        project.leaderId = this.state.currentUser.id;
                        project.updatedAt = new Date().toISOString();
                        cleaned = true;
                    }
                }

                // Ensure leader is in memberIds
                if (project.leaderId && project.memberIds && !project.memberIds.includes(project.leaderId)) {
                    console.log(`Adding leader ${project.leaderId} to memberIds for project "${project.name}"`);
                    project.memberIds.push(project.leaderId);
                    project.updatedAt = new Date().toISOString();
                    cleaned = true;
                }
            });
        }

        // Clean up tasks
        if (this.state.tasks) {
            this.state.tasks.forEach(task => {
                if (task.assignedTo && !validUserIds.includes(task.assignedTo)) {
                    console.log(`Removing invalid assignee ID ${task.assignedTo} from task "${task.title}"`);
                    task.assignedTo = null; // Unassign invalid users
                    task.updatedAt = new Date().toISOString();
                    cleaned = true;
                }
            });
        }

        if (cleaned) {
            console.log('🧹 Invalid member references cleaned up');
            this.saveData();
        } else {
            console.log('✅ No invalid member references found');
        }
    }

    /**
     * Refresh member dropdowns after user sync
     */
    refreshMemberDropdowns() {
        console.log('🔄 Refreshing member dropdowns after user sync');
        if (this.controllers && this.controllers.project && this.controllers.project.populateMemberDropdown) {
            // Refresh the member dropdown in the project controller
            this.controllers.project.populateMemberDropdown();
            console.log('✅ Member dropdowns refreshed');
        }
    }

    /**
     * Load and apply EmailJS configuration from localStorage
     */
    loadEmailJSConfig() {
        try {
            const emailjsConfig = localStorage.getItem('rms_emailjs_config');
            if (emailjsConfig) {
                const config = JSON.parse(emailjsConfig);
                if (config.serviceId && config.templateId && config.publicKey) {
                    this.emailService.updateConfig(config);
                    console.log('✅ EmailJS configuration loaded from localStorage');
                } else {
                    console.log('⚠️ Incomplete EmailJS config in localStorage');
                }
            } else {
                console.log('⚠️ No EmailJS configuration found in localStorage');
            }
        } catch (error) {
            console.error('❌ Error loading EmailJS config:', error);
        }
    }

    /**
     * Save EmailJS configuration to localStorage
     */
    saveEmailJSConfig(serviceId, templateId, publicKey, defaultCarrier = 'verizon') {
        try {
            const config = {
                serviceId: serviceId || this.emailService.serviceId,
                templateId: templateId || this.emailService.templateId,
                publicKey: publicKey || this.emailService.publicKey,
                defaultCarrier: defaultCarrier || this.emailService.defaultCarrier,
                savedAt: new Date().toISOString()
            };

            localStorage.setItem('rms_emailjs_config', JSON.stringify(config));
            console.log('💾 EmailJS configuration saved to localStorage');

            // Apply the configuration immediately
            this.emailService.updateConfig(config);
        } catch (error) {
            console.error('❌ Error saving EmailJS config:', error);
        }
    }

    /**
     * Destroy the application
     */
    destroy() {
        // Clear auto-save interval
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        // Save final state
        this.saveData();

        console.log('🛑 RMS Application destroyed');
    }
}
