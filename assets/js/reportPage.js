// Tailwind Configuration
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      backgroundColor: {
        primary: 'var(--bg-primary)',
        secondary: 'var(--bg-secondary)',
        accent: 'var(--bg-accent)',
      },
      textColor: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        accent: 'var(--text-accent)',
      },
      borderColor: {
        DEFAULT: 'var(--border-color)',
        input: 'var(--input-border)',
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', function() {
  // Dark mode toggle handler
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (localStorage.getItem('darkMode') === 'enabled' || 
      window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
  }

  darkModeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', 
      document.documentElement.classList.contains('dark') ? 'enabled' : null
    );
  });

  // DOM Element References
  const addTaskBtn = document.getElementById('addTaskBtn');
  const taskContainer = document.getElementById('taskContainer');
  const submitBtn = document.getElementById('submitBtn');
  const totalTimeDisplay = document.getElementById('totalTime');
  const form = document.getElementById('activityReportForm');

  // Event Listeners
  addTaskBtn.addEventListener('click', handleAddTask);
  form.addEventListener('submit', handleFormSubmission);
  
  // Add listeners to initial task row
  const initialTaskRow = taskContainer.querySelector('.task-row');
  attachTaskRowEventListeners(initialTaskRow);

  // Load existing submissions
  displayRecentSubmissions();

  // Clear All button listener
  document.getElementById('clearSubmissionsBtn').addEventListener('click', clearSubmissions);

  // All the remaining JavaScript functions
  function handleAddTask() {
    const taskRow = createTaskRow();
    taskContainer.appendChild(taskRow);
    updateTotalTime();
    validateForm();
  }

  function handleInputChanges(e) {
    if (e.target.classList.contains('time-input')) {
      updateTotalTime();
    }
    validateForm();
  }

  function attachTaskRowEventListeners(taskRow) {
    const timeInput = taskRow.querySelector('.time-input');
    const taskDescription = taskRow.querySelector('.task-description');
    const removeBtn = taskRow.querySelector('.remove-task-btn');

    timeInput.addEventListener('input', handleInputChanges);
    taskDescription.addEventListener('input', handleInputChanges);

    removeBtn.addEventListener('click', () => {
      if (taskContainer.children.length > 1) {
        taskRow.remove();
        updateTotalTime();
        validateForm();
      }
    });
  }

  function createTaskRow() {
    const taskRow = document.createElement('div');
    taskRow.className = 'task-row bg-accent p-4 rounded-lg border border-input';
    taskRow.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        <div>
          <label class="block text-sm font-medium text-primary mb-1">Time (hours)</label>
          <input type="number" step="0.5" min="0" max="24" class="time-input w-full px-3 py-2 bg-secondary border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-primary" placeholder="0.0">
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-primary mb-1">Task Description</label>
          <textarea rows="3" class="task-description w-full px-3 py-2 bg-secondary border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-primary resize-none" placeholder="Describe the task or activity..."></textarea>
        </div>
        <div class="flex items-end">
          <button type="button" class="remove-task-btn w-full md:w-auto inline-flex items-center justify-center px-3 py-2 border border-[var(--danger-button)] text-sm font-medium rounded-md text-[var(--danger-button)] bg-secondary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors whitespace-nowrap cursor-pointer">
            <i class="ri-delete-bin-line mr-1"></i>
            Remove
          </button>
        </div>
      </div>
    `;
    attachTaskRowEventListeners(taskRow);
    return taskRow;
  }

  function updateTotalTime() {
    const timeInputs = document.querySelectorAll('.time-input');
    const total = Array.from(timeInputs)
      .reduce((sum, input) => sum + (parseFloat(input.value) || 0), 0);
    totalTimeDisplay.value = total.toFixed(1) + ' hours';
  }

  function validateForm() {
    const tasks = Array.from(document.querySelectorAll('.task-row'))
      .some(row => {
        const time = parseFloat(row.querySelector('.time-input').value) || 0;
        const description = row.querySelector('.task-description').value.trim();
        return time > 0 && description.length > 0;
      });

    submitBtn.disabled = !tasks;
    submitBtn.className = tasks
      ? 'w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--primary-button)] hover:bg-[var(--primary-button-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 cursor-pointer whitespace-nowrap'
      : 'w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-400 cursor-not-allowed transition-all duration-200 whitespace-nowrap';
  }

  function handleFormSubmission(e) {
    e.preventDefault();
    if (submitBtn.disabled) return;

    const formData = {
      tasks: Array.from(document.querySelectorAll('.task-row'))
        .map(row => ({
          time: parseFloat(row.querySelector('.time-input').value) || 0,
          description: row.querySelector('.task-description').value.trim()
        }))
        .filter(task => task.time > 0 && task.description),
      totalTime: totalTimeDisplay.value,
      attachment: document.getElementById('attachment').files[0]?.name || null,
      timestamp: new Date().toISOString()
    };

    saveSubmission(formData);
    displayRecentSubmissions();
    showSubmissionSuccess();
    setTimeout(resetForm, 2000);
  }

  function showSubmissionSuccess() {
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="ri-check-line mr-2"></i>Report Submitted Successfully!';
    submitBtn.className = 'w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--success)] transition-all duration-200 whitespace-nowrap';
    
    setTimeout(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = true;
      validateForm();
    }, 2000);
  }

  function saveSubmission(formData) {
    const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    submissions.unshift(formData);
    localStorage.setItem('submissions', JSON.stringify(submissions.slice(0, 5)));
  }

  function displayRecentSubmissions() {
    const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    const container = document.getElementById('recentSubmissions');
    const clearBtn = document.getElementById('clearSubmissionsBtn');
    
    clearBtn.disabled = submissions.length === 0;
    clearBtn.classList.toggle('opacity-50', submissions.length === 0);
    clearBtn.classList.toggle('cursor-not-allowed', submissions.length === 0);

    container.innerHTML = submissions.length ? submissions.map(submission => `
      <div class="bg-accent rounded-lg p-4 border border-input">
        <div class="flex justify-between items-start mb-3">
          <div class="text-sm text-secondary">
            ${new Date(submission.timestamp).toLocaleString()}
          </div>
          <div class="text-sm font-medium text-primary">
            ${submission.totalTime}
          </div>
        </div>
        <div class="space-y-3">
          ${submission.tasks.map(task => `
            <div class="flex gap-3">
              <div class="text-sm font-medium text-secondary w-16">${task.time}h</div>
              <div class="text-sm text-primary">${task.description}</div>
            </div>
          `).join('')}
        </div>
        ${submission.attachment ? `
          <div class="mt-3 text-sm text-secondary">
            <i class="ri-attachment-2 mr-1"></i>
            ${submission.attachment}
          </div>
        ` : ''}
      </div>
    `).join('') : '<p class="text-secondary">No recent submissions</p>';
  }

  function clearSubmissions() {
    if (confirm('Are you sure you want to clear all submissions? This cannot be undone.')) {
      localStorage.removeItem('submissions');
      displayRecentSubmissions();
    }
  }

  function resetForm() {
    taskContainer.innerHTML = '';
    handleAddTask();
    document.getElementById('attachment').value = '';
    updateTotalTime();
    validateForm();
  }

  // Initial calls
  displayRecentSubmissions();
  validateForm();
  updateTotalTime();
});
