// Task Management Class
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.darkMode = localStorage.getItem('darkMode') === 'true';
        this.initializeEventListeners();
        this.loadTasks();
    }

    initializeEventListeners() {
        // Modal controls
        document.getElementById('addTaskBtn').addEventListener('click', () => this.showModal());
        document.getElementById('cancelTask').addEventListener('click', () => this.hideModal());
        document.getElementById('taskForm').addEventListener('submit', (e) => this.handleTaskSubmit(e));
        document.getElementById('darkModeToggle').addEventListener('click', () => this.toggleDarkMode());
    }

    toggleDarkMode() {
        console.log('Toggling dark mode', this.darkMode);
        this.darkMode = !this.darkMode;
        if (this.darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', this.darkMode);
        
        // Update icon visibility
        const sunIcon = document.querySelector('.ri-sun-line');
        const moonIcon = document.querySelector('.ri-moon-line');
        if (this.darkMode) {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        } else {
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        }
    }

    showModal() {
        document.getElementById('taskModal').style.display = 'flex';
    }

    hideModal() {
        document.getElementById('taskModal').style.display = 'none';
        document.getElementById('taskForm').reset();
    }

    handleTaskSubmit(e) {
        e.preventDefault();
        const task = {
            id: Date.now(),
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            dueDate: document.getElementById('taskDueDate').value,
            priority: document.getElementById('taskPriority').value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.hideModal();
    }

    toggleTaskComplete(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveTasks();
        this.renderTasks();
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        this.renderTasks();
    }

    renderTasks() {
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '';

        this.tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.className = `task-item ${task.completed ? 'completed' : ''} 
                    bg-accent border border-input rounded-lg p-4 transition-all`;
                
                taskElement.innerHTML = `
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <input type="checkbox" 
                                class="form-checkbox h-5 w-5 text-[var(--primary-button)]" 
                                ${task.completed ? 'checked' : ''}
                                onchange="taskManager.toggleTaskComplete(${task.id})">
                            <div>
                                <h3 class="text-lg font-semibold ${task.completed ? 'line-through' : ''}">${task.title}</h3>
                                <p class="text-secondary text-sm">${task.description}</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-4">
                            <span class="text-sm priority-${task.priority}">${task.priority}</span>
                            <span class="text-sm">${new Date(task.dueDate).toLocaleDateString()}</span>
                            <button onclick="taskManager.deleteTask(${task.id})" 
                                class="text-red-500 hover:text-red-600">
                                <i class="ri-delete-bin-line"></i>
                            </button>
                        </div>
                    </div>
                `;
                taskList.appendChild(taskElement);
            });
    }
}

// Initialize Task Manager
const taskManager = new TaskManager();
