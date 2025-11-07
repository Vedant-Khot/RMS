/**
 * Notification Service
 * Handles in-app notifications and toast messages
 */
class NotificationService {
    constructor() {
        this.container = null;
        this.notifications = [];
        this.duration = 5000; // Default duration for notifications
    }

    /**
     * Initialize the notification service
     */
    initialize() {
        this.createContainer();
    }

    /**
     * Create notification container
     */
    createContainer() {
        if (this.container) return;

        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        this.container.id = 'toastContainer';
        document.body.appendChild(this.container);
    }

    /**
     * Show notification
     */
    show(message, type = 'info', duration = null) {
        const notification = this.createNotification(message, type, duration);
        this.container.appendChild(notification);

        // Auto remove after duration
        const actualDuration = duration || this.duration;
        if (actualDuration > 0) {
            setTimeout(() => {
                this.remove(notification);
            }, actualDuration);
        }

        return notification;
    }

    /**
     * Create notification element
     */
    createNotification(message, type, duration) {
        const notification = document.createElement('div');
        notification.className = `toast toast-${type}`;

        const icon = this.getIcon(type);
        const isAutoHide = duration !== 0;

        notification.innerHTML = `
            <div class="toast-content">
                <i class="${icon}"></i>
                <span class="toast-message">${this.escapeHtml(message)}</span>
                ${isAutoHide ? '<button class="toast-close">&times;</button>' : ''}
            </div>
        `;

        // Add close handler
        if (isAutoHide) {
            const closeBtn = notification.querySelector('.toast-close');
            closeBtn.addEventListener('click', () => {
                this.remove(notification);
            });
        }

        // Add animation classes
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        return notification;
    }

    /**
     * Remove notification
     */
    remove(notification) {
        if (!notification) return;

        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    /**
     * Show success notification
     */
    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    /**
     * Show error notification
     */
    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    /**
     * Show warning notification
     */
    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    /**
     * Show info notification
     */
    info(message, duration) {
        return this.show(message, 'info', duration);
    }

    /**
     * Clear all notifications
     */
    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }

    /**
     * Get icon for notification type
     */
    getIcon(type) {
        const icons = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-times-circle',
            'warning': 'fas fa-exclamation-triangle',
            'info': 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Set default duration for notifications
     */
    setDuration(duration) {
        this.duration = duration;
    }
}
