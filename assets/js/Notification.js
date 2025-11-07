/**
 * Notification Model
 * Represents a notification in the RMS system
 */
class Notification {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.userId = data.userId || '';
        this.type = data.type || 'info'; // info, success, warning, error
        this.title = data.title || '';
        this.message = data.message || '';
        this.isRead = data.isRead || false;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.readAt = data.readAt || null;
        this.actionUrl = data.actionUrl || '';
        this.priority = data.priority || 'normal'; // low, normal, high
    }

    /**
     * Generate a unique ID for the notification
     */
    generateId() {
        return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Mark notification as read
     */
    markAsRead() {
        this.isRead = true;
        this.readAt = new Date().toISOString();
    }

    /**
     * Mark notification as unread
     */
    markAsUnread() {
        this.isRead = false;
        this.readAt = null;
    }

    /**
     * Get time elapsed since notification was created
     */
    getTimeElapsed() {
        const now = new Date();
        const created = new Date(this.createdAt);
        const diffMs = now - created;

        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    }

    /**
     * Get notification icon based on type
     */
    getIcon() {
        const icons = {
            'info': 'fas fa-info-circle',
            'success': 'fas fa-check-circle',
            'warning': 'fas fa-exclamation-triangle',
            'error': 'fas fa-times-circle'
        };
        return icons[this.type] || icons.info;
    }

    /**
     * Convert to plain object for storage
     */
    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            type: this.type,
            title: this.title,
            message: this.message,
            isRead: this.isRead,
            createdAt: this.createdAt,
            readAt: this.readAt,
            actionUrl: this.actionUrl,
            priority: this.priority
        };
    }

    /**
     * Create Notification instance from plain object
     */
    static fromJSON(data) {
        return new Notification(data);
    }
}
