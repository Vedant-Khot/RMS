// Task Management Class
class TaskManager {
    constructor() {
        // Load existing tasks and dark mode preference from localStorage
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.darkMode = localStorage.getItem('darkMode') === 'true';
        // Initialize the manager
        this.init();
    }

    // Initialize the TaskManager: bind events and load tasks
    init() {
        this.bindEvents();
        this.initializeDarkMode();
        // populate assignee list (separate function so you can switch to fetching later)
        this.populateAssignees(); // fetches assignees and fills select
        this.loadTasks(); 
    }

    // Bind UI event listeners
    bindEvents() {
        // Modal controls
        const addBtn = document.getElementById('addTaskBtn');
        const cancelBtn = document.getElementById('cancelTask');
        const form = document.getElementById('taskForm');
        const darkToggle = document.getElementById('darkModeToggle');
        const closeBtn = document.getElementById('closeTaskModal');
        const modal = document.getElementById('taskModal');

        if (addBtn) addBtn.addEventListener('click', () => this.showModal());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.hideModal());
        if (closeBtn) closeBtn.addEventListener('click', () => this.hideModal());
        // close when clicking on overlay (but not when clicking modal content)
        if (modal) modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hideModal();
        });
        // close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.hideModal();
        });

        if (form) form.addEventListener('submit', (e) => this.handleTaskSubmit(e));
        if (darkToggle) darkToggle.addEventListener('click', () => this.toggleDarkMode());
    }

    // Initialize dark mode based on saved preference or system preference
    initializeDarkMode() {
        if (this.darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            // If no saved preference, use system preference
            if (localStorage.getItem('darkMode') === null && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.darkMode = true;
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
        this.updateDarkModeIcons();
    }

    // Toggle dark mode state and persist it
    toggleDarkMode() {
        this.darkMode = !this.darkMode;
        if (this.darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', this.darkMode);
        this.updateDarkModeIcons();
    }

    // Update sun/moon icon visibility to reflect the current theme
    updateDarkModeIcons() {
        const sunIcon = document.querySelector('.ri-sun-line');
        const moonIcon = document.querySelector('.ri-moon-line');
        if (sunIcon && moonIcon) {
            if (this.darkMode) {
                sunIcon.classList.add('hidden');
                moonIcon.classList.remove('hidden');
            } else {
                sunIcon.classList.remove('hidden');
                moonIcon.classList.add('hidden');
            }
        }
    }

    // Show the add-task modal
    showModal() {
        const modal = document.getElementById('taskModal');
        if (modal) {
            // refresh assignee list each time modal opens (keeps dynamic sources in sync)
            this.populateAssignees();
            modal.classList.remove('hidden');
            // focus first input for accessibility
            const firstInput = document.getElementById('taskTitle');
            if (firstInput) firstInput.focus();
        }
    }

    // Hide the add-task modal and reset the form
    hideModal() {
        const modal = document.getElementById('taskModal');
        const form = document.getElementById('taskForm');
        if (modal) {
            modal.classList.add('hidden');
        }
        if (form) form.reset();
    }

    // Gather form values from the UI
    getFormData() {
        const assigneeSelect = document.getElementById('taskAssignee');
        const assigneeId = assigneeSelect?.value || '';
        const assigneeName = assigneeSelect?.selectedOptions?.[0]?.text || '';
        return {
            title: document.getElementById('taskTitle')?.value || '',
            description: document.getElementById('taskDescription')?.value || '',
            dueDate: document.getElementById('taskDueDate')?.value || '',
            priority: document.getElementById('taskPriority')?.value || 'low',
            assignee: assigneeId ? { id: assigneeId, name: assigneeName } : null
        };
    }

    // Create a task object from form values
    createTaskObject(formData) {
        return {
            id: Date.now(),
            title: formData.title,
            description: formData.description,
            dueDate: formData.dueDate,
            priority: formData.priority,
            assignee: formData.assignee || null,
            completed: false,
            createdAt: new Date().toISOString()
        };
    }

    // Handle form submission: create task and update UI/storage
    handleTaskSubmit(e) {
        e.preventDefault();
        const formData = this.getFormData();
        const task = this.createTaskObject(formData);
        this.addTask(task);
        this.hideModal();
    }

    // Add a task to the list and persist
    addTask(task) {
        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
    }

    // Toggle completion state for a task by id
    toggleTaskComplete(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    // Delete a task by id
    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveTasks();
        this.renderTasks();
    }

    // Save tasks array to localStorage
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    // Load tasks (renders current in-memory tasks)
    loadTasks() {
        this.renderTasks();
    }

    // Render tasks into the DOM
    renderTasks() {
        const taskList = document.getElementById('taskList');
        if (!taskList) return;
        taskList.innerHTML = '';

        // Helper: safe date numeric value for sorting (invalid => very large)
        const dateValue = (d) => {
            const dt = new Date(d);
            return isNaN(dt.getTime()) ? Number.POSITIVE_INFINITY : dt.getTime();
        };

        // Helper: user-friendly date string (or placeholder)
        const displayDate = (d) => {
            if (!d) return '—';
            const dt = new Date(d);
            return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString();
        };

        // Helper: create single task element (keeps existing markup/handlers)
        const createTaskElement = (task) => {
            const el = document.createElement('div');
            el.className = `task-item ${task.completed ? 'completed' : ''} bg-accent border border-input rounded-lg p-4 transition-all`;
            el.setAttribute('role', 'button');
            el.tabIndex = 0; // make keyboard-focusable
            el.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <input type="checkbox" 
                            class="form-checkbox h-5 w-5 text-[var(--primary-button)] task-checkbox" 
                            ${task.completed ? 'checked' : ''}
                            onchange="taskManager.toggleTaskComplete(${task.id})">
                        <div>
                            <h3 class="text-lg font-semibold ${task.completed ? 'line-through' : ''}">${task.title}</h3>
                            <p class="text-secondary text-sm">${task.description}</p>
                            ${task.assignee ? `<div class="text-sm text-accent mt-1">Assigned to: <strong class="text-secondary">${task.assignee.name}</strong></div>` : ''}
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-sm priority-badge priority-${task.priority}">${(task.priority || '').charAt(0).toUpperCase() + (task.priority || '').slice(1)}</span>
                        <span class="text-sm">${displayDate(task.dueDate)}</span>
                        <button onclick="taskManager.deleteTask(${task.id})" 
                            class="text-red-500 hover:text-red-600">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                </div>
            `;

            // Click handler: toggle completion unless the click originated from an interactive control
            el.addEventListener('click', (e) => {
                const interactive = e.target.closest('input, button, a, select, textarea, label');
                if (interactive) return; // let the control handle it
                this.toggleTaskComplete(task.id);
            });

            // Keyboard accessibility: toggle on Enter or Space
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    // prevent page scroll on Space
                    e.preventDefault();
                    this.toggleTaskComplete(task.id);
                }
            });

            return el;
        };

        // Prepare groups: pending and completed, each split by priority
        const priorityOrder = ['high', 'medium', 'low'];
        const emptyGroups = () => ({ high: [], medium: [], low: [] });
        const pending = emptyGroups();
        const completed = emptyGroups();

        this.tasks.forEach(t => {
            const p = (t.priority || 'low').toLowerCase();
            if (t.completed) {
                (completed[p] || completed.low).push(t);
            } else {
                (pending[p] || pending.low).push(t);
            }
        });

        // Small helper to render groups for a given container and titlePrefix
        const renderPriorityGroups = (groups, includeHeader = true, completedFlag = false) => {
            priorityOrder.forEach(priorityKey => {
                const group = groups[priorityKey];
                if (!group.length) return;

                // sort by due date (earliest first), invalid dates go last
                group.sort((a, b) => dateValue(a.dueDate) - dateValue(b.dueDate));

                // Section wrapper
                const section = document.createElement('div');
                section.className = 'priority-section mb-4';

                // Header: e.g., "High Priority" or "High Priority (Completed)"
                if (includeHeader) {
                    const header = document.createElement('div');
                    header.className = 'flex items-center justify-between mb-2';
                    const title = document.createElement('h3');
                    title.className = 'text-md font-semibold text-primary';
                    title.textContent = `${priorityKey.charAt(0).toUpperCase() + priorityKey.slice(1)} Priority${completedFlag ? ' (Completed)' : ''}`;
                    const count = document.createElement('span');
                    count.className = 'text-sm text-secondary';
                    count.textContent = `${group.length} ${group.length === 1 ? 'task' : 'tasks'}`;
                    header.appendChild(title);
                    header.appendChild(count);
                    section.appendChild(header);
                }

                // Container for tasks in this priority
                const listContainer = document.createElement('div');
                listContainer.className = 'space-y-3';
                group.forEach(task => {
                    listContainer.appendChild(createTaskElement(task));
                });
                section.appendChild(listContainer);

                taskList.appendChild(section);
            });
        };

        // 1) Render pending tasks first (by priority)
        renderPriorityGroups(pending, true, false);

        // 2) If there are any completed tasks, render a divider/header then completed groups (still by priority)
        const anyCompleted = priorityOrder.some(k => completed[k].length > 0);
        if (anyCompleted) {
            const divider = document.createElement('div');
            divider.className = 'mt-6 mb-2';
            divider.innerHTML = `<h3 class="text-sm font-semibold text-secondary">Completed</h3>`;
            taskList.appendChild(divider);

            renderPriorityGroups(completed, true, true);
        }
    }

    // -- Assignee provider (separated) --
    // fetchAssignees: placeholder for future fetching. Returns Promise<array<{id,name}>>.
    async fetchAssignees() {
        // replace this with a real fetch later; keep as promise for compatibility
        return Promise.resolve([
            { id: 'u1', name: 'Alice' },
            { id: 'u2', name: 'Bob' },
            { id: 'u3', name: 'Charlie' }
        ]);
    }

    // populateAssignees: fills the select with options from fetchAssignees 
    // Add dynamic fetching and error handling 
    async populateAssignees() {
        const select = document.getElementById('taskAssignee');
        if (!select) return;
        // keep current selection if any
        const current = select.value || '';
        // clear except keep default "Unassigned"
        select.innerHTML = `<option value="">Unassigned</option>`;
        try {
            const list = await this.fetchAssignees();
            list.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m.id;
                opt.textContent = m.name;
                select.appendChild(opt);
            });
            // restore selection when possible
            if (current) select.value = current;
        } catch (err) {
            // silently fail — UI stays with Unassigned
            console.error('Failed to populate assignees', err);
        }
    }
}

// Initialize Task Manager
const taskManager = new TaskManager();
