
const dashboard = {
  // the section that is currently being shown
  currentSection: "projects",

  // user profile handler (set in init)
  userProfile: null,

  // start everything
  init() {
    this.userProfile = new UserProfile();
    // apply stored accent color on load
    const html = document.documentElement;
    html.className = html.className.replace(/\bcolor-\w+\b/g, '') + ' color-' + this.userProfile.settings.color;
    // set accent-color and primary-color for form elements and profile section
    const colorMap = { red: '#f44336', orange: '#ff9800', yellow: '#ffeb3b', green: '#4caf50', blue: '#2196f3', indigo: '#3f51b5', violet: '#9c27b0' };
    const accentValue = colorMap[this.userProfile.settings.color] || '#2196f3';
    html.style.setProperty('accent-color', accentValue);
    html.style.setProperty('--color-primary', accentValue);
    // apply stored theme on load
    if (this.userProfile.settings.theme === 'dark') {
      html.classList.add('theme-dark');
      html.classList.remove('theme-light');
    } else {
      html.classList.add('theme-light');
      html.classList.remove('theme-dark');
    }
    // set navbar avatar initials
    const initials = this.userProfile.user.name.charAt(0).toUpperCase();
    document.getElementById('userAvatar').textContent = initials;
    this.attachEvents();
    this.switchSection(this.currentSection);
    this.userProfile.bindEvents(); // bind after DOM is ready
  },

  /*
   * Think of this like teaching the page how to react
   * whenever someone clicks a button.
   */
  attachEvents() {

    // --- NAVIGATION SIDEBAR ---
    this.onClick("hamburgerMenu", () => this.toggleSidebar("navigationSidebar"));
    this.onClick("closeNavigationSidebar", () => this.hideSidebar("navigationSidebar"));
    this.onClick("navOverlay", () => this.hideSidebar("navigationSidebar"));

    // clicking a menu button switches sections
    document.querySelectorAll(".nav-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.switchSection(btn.dataset.nav);
        this.hideSidebar("navigationSidebar");
      });
    });

    // --- PROFILE SIDEBAR ---
    this.onClick("userAvatar", () => this.toggleSidebar("profileSidebar"));
    this.onClick("closeProfileSidebar", () => this.hideSidebar("profileSidebar"));
    this.onClick("profileOverlay", () => this.hideSidebar("profileSidebar"));

    // --- BRAND TITLE (Go to Dashboard) ---
    this.onClick("brandTitle", () => this.goHome());

    // --- THEME SWITCH (LIGHT ↔ DARK) ---
    this.onClick("themeToggle", () => this.toggleTheme());

    // --- TAB BUTTONS (switch content) ---
    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.switchSection(btn.dataset.tab);
      });
    });

    // --- CREATE BUTTONS (open popups/modals) ---
    this.onClick("createProjectBtn", () => this.openModal("projectModal"));
    this.onClick("createTaskBtn", () => this.openModal("taskModal"));
    this.onClick("manageRolesBtn", () => this.openModal("roleModal"));

    // Quick actions inside sidebar
    this.onClick("quickCreateProject", () => {
      this.openModal("projectModal");
      this.hideSidebar("navigationSidebar");
    });

    this.onClick("quickAddTask", () => {
      this.openModal("taskModal");
      this.hideSidebar("navigationSidebar");
    });

    this.onClick("quickNotifications", () => {
      this.toggleNotifications();
      this.hideSidebar("navigationSidebar");
    });

    // Close modals
    document.querySelectorAll(".modal-close").forEach(btn => {
      btn.addEventListener("click", () => {
        this.closeModal(btn.dataset.modal);
      });
    });

    // Notification button
    this.onClick("notificationsBtn", () => this.toggleNotifications());
  },


  // ----- Helpers -----

  // small helper: "when someone clicks this element, do this action"
  onClick(id, action) {
    document.getElementById(id).addEventListener("click", action);
  },


  // ----- Sidebar Control -----

  // show or hide a sidebar like a door opening/closing
  toggleSidebar(id) {
    document.getElementById(id).classList.toggle("show");
    if (id === "profileSidebar" && document.getElementById(id).classList.contains("show")) {
      this.userProfile.displayProfile();
    }
  },

  hideSidebar(id) {
    document.getElementById(id).classList.remove("show");
  },


  // ----- Theme Switcher -----

  /*
   * Light mode <-> Dark mode
   * Like switching between day and night.
   */
  toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.contains("theme-dark");

    html.classList.toggle("theme-dark", !isDark);
    html.classList.toggle("theme-light", isDark);

    localStorage.setItem("theme", isDark ? "light" : "dark");
  },


  // ----- Tab / Section Switching -----

  /*
   * Hide all sections → show the one we want.
   * Like flipping pages in a book.
   */
  switchSection(name) {
    // hide everything
    document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));

    // show the chosen one
    document.getElementById(name + "Tab").classList.add("active");
    document.querySelector(`[data-tab="${name}"]`).classList.add("active");

    this.currentSection = name;
  },


  // ----- Modals / Popups -----

  openModal(id) {
    document.getElementById(id).classList.add("show");
  },

  closeModal(id) {
    document.getElementById(id).classList.remove("show");
  },


  // ----- Go to Home/Dashboard -----

  goHome() {
    this.switchSection("projects");
    this.hideSidebar("navigationSidebar");
    this.hideSidebar("profileSidebar");
  },

  // ----- Notifications Panel -----

  toggleNotifications() {
    document.getElementById("notificationsPanel").classList.toggle("show");
  }
};

// User Profile Class to make profile section work
class UserProfile {
    // Constructor: set up initial data
    constructor() {
        // load user data from local storage (or use defaults)
        this.user = {
            name: localStorage.getItem('userName') || 'John Doe',
            role: localStorage.getItem('userRole') || 'Member',
            email: localStorage.getItem('userEmail') || '',
            phone: localStorage.getItem('userPhone') || '',
            avatar: localStorage.getItem('userAvatar') || 'JD', // initials
            projectsCount: parseInt(localStorage.getItem('projectsCount')) || 0,
            tasksCompleted: parseInt(localStorage.getItem('tasksCompleted')) || 0
        };

        // settings
        this.settings = {
            autoSave: localStorage.getItem('autoSave') === 'true',
            theme: localStorage.getItem('theme') || 'light',
            color: localStorage.getItem('accentColor') || 'blue',
            emailNotifications: localStorage.getItem('emailNotifications') !== 'false',
            smsNotifications: localStorage.getItem('smsNotifications') !== 'false',
            browserNotifications: localStorage.getItem('browserNotifications') !== 'false',
            deadlineNotifications: localStorage.getItem('deadlineNotifications') !== 'false',
            overdueNotifications: localStorage.getItem('overdueNotifications') !== 'false'
        };
    }

    // Bind events to form elements
    bindEvents() {
        // settings changes - update on change
        const addListener = (id, listener) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', listener);
        };

        addListener('sidebarAutoSave', () => this.updateSetting('autoSave'));
        document.querySelectorAll('input[name="sidebarTheme"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateThemeSetting());
        });
        addListener('sidebarColor', () => this.updateSetting('color'));
        addListener('sidebarUserEmail', () => this.updateUserInfo('email'));
        addListener('sidebarUserPhone', () => this.updateUserInfo('phone'));
        addListener('sidebarEmailNotifications', () => this.updateNotificationSetting('emailNotifications'));
        addListener('sidebarSmsNotifications', () => this.updateNotificationSetting('smsNotifications'));
        addListener('sidebarBrowserNotifications', () => this.updateNotificationSetting('browserNotifications'));
        addListener('sidebarDeadlineNotifications', () => this.updateNotificationSetting('deadlineNotifications'));
        addListener('sidebarOverdueNotifications', () => this.updateNotificationSetting('overdueNotifications'));
    }

    // Show profile info
    displayProfile() {
        // user info
        this.setText('sidebarUserName', this.user.name);
        this.setText('sidebarUserRole', this.user.role);
        const initials = this.user.name.charAt(0).toUpperCase();
        this.setText('sidebarUserAvatar', initials);
        // inputs
        const emailEl = document.getElementById('sidebarUserEmail');
        const phoneEl = document.getElementById('sidebarUserPhone');
        if (emailEl) emailEl.value = this.user.email;
        if (phoneEl) phoneEl.value = this.user.phone;
        // settings - read fresh from localStorage
        const autoEl = document.getElementById('sidebarAutoSave');
        if (autoEl) autoEl.checked = localStorage.getItem('autoSave') === 'true';
        const theme = localStorage.getItem('theme') || 'light';
        document.querySelector(`input[name="sidebarTheme"][value="${theme}"]`).checked = true;
        const colorEl = document.getElementById('sidebarColor');
        if (colorEl) colorEl.value = localStorage.getItem('accentColor') || 'blue';
        this.setText('projectsCount', this.user.projectsCount.toString());
        this.setText('tasksCompleted', this.user.tasksCompleted.toString());
        // notifications
        this.setChecked('sidebarEmailNotifications', localStorage.getItem('emailNotifications') !== 'false');
        this.setChecked('sidebarSmsNotifications', localStorage.getItem('smsNotifications') !== 'false');
        this.setChecked('sidebarBrowserNotifications', localStorage.getItem('browserNotifications') !== 'false');
        this.setChecked('sidebarDeadlineNotifications', localStorage.getItem('deadlineNotifications') !== 'false');
        this.setChecked('sidebarOverdueNotifications', localStorage.getItem('overdueNotifications') !== 'false');
    }

    // Helpers to prevent null errors
    setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    setChecked(id, checked) {
        const el = document.getElementById(id);
        if (el) el.checked = checked;
    }

    // Update a setting
    updateSetting(key) {
        if (key === 'autoSave') {
            this.settings.autoSave = document.getElementById('sidebarAutoSave').checked;
            localStorage.setItem('autoSave', this.settings.autoSave);
        } else if (key === 'color') {
            this.settings.color = document.getElementById('sidebarColor').value;
            localStorage.setItem('accentColor', this.settings.color);
            // apply accent color by changing class
            const html = document.documentElement;
            html.className = html.className.replace(/\bcolor-\w+\b/g, '') + ' color-' + this.settings.color;
            // set accent-color and primary-color for form elements and profile section
            const colorMap = { red: '#f44336', orange: '#ff9800', yellow: '#ffeb3b', green: '#4caf50', blue: '#2196f3', indigo: '#3f51b5', violet: '#9c27b0' };
            const accentValue = colorMap[this.settings.color] || '#2196f3';
            html.style.setProperty('accent-color', accentValue);
            html.style.setProperty('--color-primary', accentValue);
        }
    }

    // Special for theme radios - actually change the theme
    updateThemeSetting() {
        this.settings.theme = document.querySelector('input[name="sidebarTheme"]:checked').value;
        localStorage.setItem('theme', this.settings.theme);
        // apply theme
        const html = document.documentElement;
        if (this.settings.theme === 'dark') {
            html.classList.add('theme-dark');
            html.classList.remove('theme-light');
        } else {
            html.classList.add('theme-light');
            html.classList.remove('theme-dark');
        }
    }

    // Update notification setting
    updateNotificationSetting(key) {
        const el = document.getElementById('sidebar' + key.charAt(0).toUpperCase() + key.slice(1));
        if (el) {
            this.settings[key] = el.checked;
            localStorage.setItem(key, this.settings[key]);
        }
    }

    // Update user info
    updateUserInfo(key) {
        this.user[key] = document.getElementById(`sidebarUser${key.charAt(0).toUpperCase() + key.slice(1)}`).value;
        localStorage.setItem(`user${key.charAt(0).toUpperCase() + key.slice(1)}`, this.user[key]);
    }

    // Update stats (call from other parts perhaps)
    updateStats(type, count) {
        if (type === 'projects') this.user.projectsCount = count;
        else if (type === 'tasks') this.user.tasksCompleted = count;
        localStorage.setItem(type + 'Count', count);
        this.displayProfile();
    }
}


// Start everything once the page is ready
document.addEventListener("DOMContentLoaded", () => {
  dashboard.init();
});
