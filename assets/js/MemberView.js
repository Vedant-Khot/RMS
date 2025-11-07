/**
 * Member View
 * Handles rendering of member-related UI components
 */
class MemberView {
    constructor() {
        this.container = null;
    }

    /**
     * Render member card
     */
    renderMemberCard(member) {
        return `
            <div class="member-card" data-member-id="${member.id}">
                <div class="member-avatar">
                    ${this.getInitials(member.name)}
                </div>
                <div class="member-details">
                    <h4 class="member-name">${this.escapeHtml(member.name)}</h4>
                    <p class="member-email">${this.escapeHtml(member.email)}</p>
                    <p class="member-role">${this.escapeHtml(member.role)}</p>
                </div>
                <div class="member-stats">
                    <span class="stat-item">
                        <i class="fas fa-project-diagram"></i>
                        0 projects
                    </span>
                    <span class="stat-item">
                        <i class="fas fa-tasks"></i>
                        0 tasks
                    </span>
                    <span class="stat-item">
                        <i class="fas fa-clock"></i>
                        Joined recently
                    </span>
                </div>
                <div class="member-actions">
                    <button class="btn btn-secondary btn-sm action-btn view-btn" data-action="view" title="View Profile">
                        <i class="fas fa-eye"></i>
                        View
                    </button>
                    <button class="btn btn-secondary btn-sm action-btn edit-btn" data-action="edit" title="Edit Member">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="btn btn-secondary btn-sm action-btn remove-btn" data-action="remove" title="Remove Member">
                        <i class="fas fa-trash"></i>
                        Remove
                    </button>
                    <button class="btn btn-secondary btn-sm action-btn done-btn" data-action="done" title="Mark Done">
                        <i class="fas fa-check"></i>
                        Done
                    </button>
                    <button class="btn btn-secondary btn-sm action-btn cancel-btn" data-action="cancel" title="Cancel">
                        <i class="fas fa-times"></i>
                        Cancel
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render member list
     */
    renderMemberList(members) {
        if (!members || members.length === 0) {
            return this.renderEmptyState('No members found', 'Add team members to get started.');
        }

        return members.map(member => this.renderMemberCard(member)).join('');
    }

    /**
     * Render empty state
     */
    renderEmptyState(title, message) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-users"></i>
                </div>
                <h3>${title}</h3>
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * Get initials from name
     */
    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
