/**
 * User Model
 * Represents a user in the RMS system
 */
class User {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.name = data.name || '';
        this.email = data.email || '';
        this.avatar = data.avatar || '';
        this.role = data.role || 'member'; // admin, manager, member
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.projectRoles = data.projectRoles || {}; // projectId -> role mapping

        // Notification preferences - Default to OFF to save email quota
        this.phone = data.phone || '';
        this.notifications = data.notifications || {
            email: false, // Changed to false by default to save email limits
            sms: false,
            browser: true,
            deadlines: true,
            overdue: true
        };
    }

    /**
     * Generate a unique ID for the user
     */
    generateId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get user's role in a specific project
     */
    getProjectRole(projectId) {
        return this.projectRoles[projectId] || 'viewer';
    }

    /**
     * Set user's role in a specific project
     */
    setProjectRole(projectId, role) {
        this.projectRoles[projectId] = role;
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Check if user has a specific permission in a project
     */
    hasPermission(projectId, permission) {
        const role = this.getProjectRole(projectId);
        const permissions = this.getRolePermissions(role);
        return permissions.includes(permission);
    }

    /**
     * Get permissions for a specific role
     */
    getRolePermissions(role) {
        const rolePermissions = {
            // Project-specific roles
            'leader': ['create', 'read', 'update', 'delete', 'manage_members', 'manage_tasks'],
            'frontend': ['create', 'read', 'update', 'manage_tasks'],
            'backend': ['create', 'read', 'update', 'manage_tasks'],
            'fullstack': ['create', 'read', 'update', 'manage_tasks', 'manage_members'],
            'designer': ['create', 'read', 'update'],
            'uiux': ['create', 'read', 'update', 'manage_tasks'],
            'tester': ['create', 'read', 'update'],
            'qa': ['create', 'read', 'update', 'manage_tasks'],
            'devops': ['create', 'read', 'update', 'manage_tasks'],
            'analyst': ['read', 'update'],
            'editor': ['create', 'read', 'update'],
            'manager': ['create', 'read', 'update', 'manage_members'],
            'coordinator': ['read', 'update', 'manage_tasks'],
            'viewer': ['read']
        };

        return rolePermissions[role] || ['read'];
    }

    /**
     * Update user profile
     */
    updateProfile(data) {
        Object.assign(this, data);
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Convert to plain object for storage
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            phone: this.phone,
            avatar: this.avatar,
            role: this.role,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            projectRoles: this.projectRoles,
            notifications: this.notifications
        };
    }

    /**
     * Create User instance from plain object
     */
    static fromJSON(data) {
        return new User(data);
    }
}
