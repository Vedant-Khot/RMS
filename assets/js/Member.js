/**
 * Member Model
 * Represents a team member in the RMS system
 */
class Member {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.userId = data.userId || '';
        this.projectId = data.projectId || '';
        this.role = data.role || 'member'; // leader, editor, viewer
        this.joinedAt = data.joinedAt || new Date().toISOString();
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.permissions = data.permissions || [];
    }

    /**
     * Generate a unique ID for the member
     */
    generateId() {
        return 'member_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Check if member has specific permission
     */
    hasPermission(permission) {
        return this.permissions.includes(permission);
    }

    /**
     * Add permission to member
     */
    addPermission(permission) {
        if (!this.permissions.includes(permission)) {
            this.permissions.push(permission);
        }
    }

    /**
     * Remove permission from member
     */
    removePermission(permission) {
        const index = this.permissions.indexOf(permission);
        if (index > -1) {
            this.permissions.splice(index, 1);
        }
    }

    /**
     * Convert to plain object for storage
     */
    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            projectId: this.projectId,
            role: this.role,
            joinedAt: this.joinedAt,
            isActive: this.isActive,
            permissions: this.permissions
        };
    }

    /**
     * Create Member instance from plain object
     */
    static fromJSON(data) {
        return new Member(data);
    }
}
