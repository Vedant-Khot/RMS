/**
 * Member Controller
 * Handles member-related functionality
 */
class MemberController {
    constructor(app) {
        this.app = app;
    }

    /**
     * Called when members tab is activated
     */
    onTabActivated() {
        this.renderMembers();
    }

    /**
     * Render members view
     */
    renderMembers() {
        const members = this.app.getUsers().filter(member => member && member.isActive !== false); // Only active members, filter out nulls
        const container = document.getElementById('membersGrid');
        const emptyState = document.getElementById('membersEmptyState');

        if (!container) return;

        // Add stats overview
        const statHtml = this.renderMemberStats(members);
        if (statHtml) {
            const contentBody = container.closest('.content-body');
            if (contentBody) {
                const statsDiv = contentBody.querySelector('.stats-overview') || document.createElement('div');
                statsDiv.className = 'stats-overview';
                statsDiv.innerHTML = statHtml;
                if (!contentBody.querySelector('.stats-overview')) {
                    contentBody.insertBefore(statsDiv, contentBody.firstChild);
                }
            }
        }

        if (members.length === 0) {
            container.innerHTML = '';
            emptyState?.classList.remove('hidden');
            return;
        }

        emptyState?.classList.add('hidden');

        container.innerHTML = members.map(member => {
            // Get projects with roles for this member
            const projectRoles = Object.entries(member.projectRoles || {});
            const activeProjects = projectRoles.length;

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
                            ${activeProjects} projects
                        </span>
                        <span class="stat-item">
                            <i class="fas fa-tasks"></i>
                            ${this.getMemberTaskCount(member.id)} tasks
                        </span>
                        <span class="stat-item">
                            <i class="fas fa-clock"></i>
                            ${this.getJoinStatus(member.joinDate)}
                        </span>
                    </div>
                    <div class="member-actions">
                        <button class="btn btn-secondary btn-sm action-btn view-btn" data-action="view" onclick="window.app.controllers.member.viewMemberProfile('${member.id}')" title="View Profile">
                            <i class="fas fa-eye"></i>
                            View
                        </button>
                        <button class="btn btn-secondary btn-sm action-btn edit-btn" data-action="edit" onclick="window.app.controllers.member.editMember('${member.id}')" title="Edit Member">
                            <i class="fas fa-edit"></i>
                            Edit
                        </button>
                        <button class="btn btn-secondary btn-sm action-btn remove-btn" data-action="remove" onclick="window.app.controllers.member.removeMember('${member.id}')" title="Remove Member">
                            <i class="fas fa-trash"></i>
                            Remove
                        </button>
                        <button class="btn btn-secondary btn-sm action-btn done-btn" data-action="done" onclick="window.app.controllers.member.editMemberDone('${member.id}')" title="Mark Done">
                            <i class="fas fa-check"></i>
                            Done
                        </button>
                        <button class="btn btn-secondary btn-sm action-btn cancel-btn" data-action="cancel" onclick="window.app.controllers.member.editMemberCancel('${member.id}')" title="Cancel">
                            <i class="fas fa-times"></i>
                            Cancel
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Edit member done action (simulated action)
     */
    editMemberDone(memberId) {
        this.app.showNotification(`Marked actions as done for member ID: ${memberId}`, 'success');
    }

    /**
     * Edit member cancel action (simulated action)
     */
    editMemberCancel(memberId) {
        this.app.showNotification(`Cancelled edit actions for member ID: ${memberId}`, 'info');
    }

    /**
     * Remove member
     */
    removeMember(memberId) {
        const member = this.app.getUsers().find(u => String(u.id) === String(memberId));
        if (!member) return;

        // Check permissions - admin or manager can remove
        const currentUser = this.app.getCurrentUser();
        if (!currentUser) return;

        if (currentUser.role !== 'admin' && currentUser.role !== 'manager') {
            this.app.showNotification('Only admins and managers can remove members.', 'error');
            return;
        }

        // Don't allow removing yourself
        if (currentUser.id === memberId) {
            this.app.showNotification('You cannot remove yourself.', 'error');
            return;
        }

        if (confirm(`Are you sure you want to remove "${member.name}" from the team? This action cannot be undone.`)) {
            // Remove member from all projects
            this.app.state.projects.forEach(project => {
                project.removeMember(memberId);
                if (project.leaderId === memberId) {
                    // Reassign leadership to current user (admin/manager)
                    project.leaderId = currentUser.id;
                    project.updatedAt = new Date().toISOString();
                }
            });

            // Remove member's project roles
            delete member.projectRoles;
            member.isActive = false;
            member.updatedAt = new Date().toISOString();

            this.app.saveData();
            this.app.showNotification(`Member "${member.name}" has been removed from the team.`, 'success');

            // Refresh members view
            this.renderMembers();
        }
    }

    /**
     * Manage member roles modal
     */
    manageRoles() {
        // Check permissions - admins and managers can manage roles
        const currentUser = this.app.getCurrentUser();
        if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'manager')) {
            this.app.showNotification('Only administrators and managers can manage member roles.', 'error');
            return;
        }

        // Populate the roles modal
        this.renderRolesModal();

        // Show the modal
        const modal = document.getElementById('roleModal');
        if (modal) {
            modal.classList.add('show');
        }
    }

    /**
     * Render the roles management modal
     */
    renderRolesModal() {
        const rolesContainer = document.getElementById('rolesContainer');
        if (!rolesContainer) return;

        const members = this.app.getUsers();
        const currentUser = this.app.getCurrentUser();

        const rolesHTML = members.map(member => {
            const canEdit = currentUser.id !== member.id; // Can't edit your own role
            const isCurrentUser = currentUser.id === member.id;

            return `
                <div class="role-member-card" data-member-id="${member.id}">
                    <div class="member-info">
                        <div class="member-avatar">${member.name.charAt(0).toUpperCase()}</div>
                        <div class="member-details">
                            <h4>${this.escapeHtml(member.name)}${isCurrentUser ? ' (You)' : ''}</h4>
                            <p>Projects: ${this.getMemberProjectCount(member.id)}</p>
                        </div>
                    </div>
                    <div class="role-selector">
                        <select class="form-select role-select ${!canEdit ? 'disabled' : ''}"
                                data-member-id="${member.id}"
                                ${!canEdit ? 'disabled' : ''}>
                            <option value="member" ${member.role === 'member' ? 'selected' : ''}>Member</option>
                            <option value="manager" ${member.role === 'manager' ? 'selected' : ''}>Manager</option>
                            <option value="admin" ${member.role === 'admin' ? 'selected' : ''}>Administrator</option>
                        </select>
                        ${!canEdit ? '<small class="role-note">You cannot change your own role</small>' : ''}
                    </div>
                </div>
            `;
        }).join('');

        rolesContainer.innerHTML = `
            <div class="roles-instructions">
                <p>Use this interface to manage team member roles. Changes will take effect immediately.</p>
                <div class="role-legends">
                    <div class="role-legend">
                        <span class="role-badge member">Member</span>
                        <span>Can create projects, assign tasks</span>
                    </div>
                    <div class="role-legend">
                        <span class="role-badge manager">Manager</span>
                        <span>Can manage projects and team members</span>
                    </div>
                    <div class="role-legend">
                        <span class="role-badge admin">Admin</span>
                        <span>Full access, manage roles and system settings</span>
                    </div>
                </div>
            </div>
            <div class="roles-list">
                ${rolesHTML}
            </div>
        `;

        // Add event listeners for role changes
        this.setupRoleChangeHandlers();
    }

    /**
     * Set up event handlers for role changes
     */
    setupRoleChangeHandlers() {
        const roleSelects = document.querySelectorAll('.role-select');
        const saveRolesBtn = document.getElementById('saveRolesBtn');

        roleSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                const memberId = e.target.getAttribute('data-member-id');
                const newRole = e.target.value;

                this.changeMemberRole(memberId, newRole);
            });
        });

        if (saveRolesBtn) {
            saveRolesBtn.addEventListener('click', () => {
                this.closeRolesModal();
                this.app.showNotification('Role changes saved successfully!', 'success');
            });
        }
    }

    /**
     * Change a member's role
     */
    changeMemberRole(memberId, newRole) {
        const member = this.app.getUsers().find(u => String(u.id) === String(memberId));
        if (!member) return;

        const oldRole = member.role;

        // Update the role
        member.role = newRole;
        member.updatedAt = new Date().toISOString();

        // Update the member record
        this.app.saveData();

        // Show notification
        const memberName = member.name;
        this.app.showNotification(`Role updated: ${memberName} is now a ${newRole}`, 'success');

        // Log the role change (could be used for audit trail)
        console.log(`Role change: ${memberName} (${memberId}) - ${oldRole} → ${newRole}`);
    }

    /**
     * Close the roles management modal
     */
    closeRolesModal() {
        const modal = document.getElementById('roleModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    /**
     * Get specializations for a member based on their project roles
     */
    getMemberSpecializations(memberId) {
        const projects = this.app.getProjects();
        const roleCounts = {};

        projects.forEach(project => {
            if (project.leaderId === memberId || project.memberIds.includes(memberId)) {
                const member = this.app.getUsers().find(u => String(u.id) === String(memberId));
                if (member) {
                    const role = member.getProjectRole(project.id);
                    roleCounts[role] = (roleCounts[role] || 0) + 1;
                }
            }
        });

        const topRoles = Object.entries(roleCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 2)
            .map(([role]) => role.charAt(0).toUpperCase() + role.slice(1));

        return topRoles.length > 0 ? topRoles.join(', ') : 'General';
    }

    /**
     * Manage project-specific roles for a member
     */
    manageProjectRoles(memberId) {
        const member = this.app.getUsers().find(u => String(u.id) === String(memberId));
        if (!member) return;

        // Check permissions - admin or manager can manage
        const currentUser = this.app.getCurrentUser();
        if (!currentUser) return;

        if (currentUser.role !== 'admin' && currentUser.role !== 'manager') {
            this.app.showNotification('Only admins and managers can manage member roles.', 'error');
            return;
        }

        // Render project-specific role management interface
        this.renderProjectRolesModal(member);
    }

    /**
     * Render project-specific role management modal
     */
    renderProjectRolesModal(member) {
        const customModal = document.getElementById('customModal') || this.createCustomModal();
        const projects = this.app.getProjects();

        const memberProjects = projects.filter(project =>
            project.leaderId === member.id || project.memberIds.includes(member.id)
        );

        const roles = ['viewer', 'editor', 'designer', 'uiux', 'frontend', 'backend', 'fullstack', 'tester', 'qa', 'devops', 'analyst', 'manager', 'coordinator', 'leader'];

        const roleOptions = roles.map(role => `
            <option value="${role}">${role.charAt(0).toUpperCase() + role.slice(1)}</option>
        `).join('');

        const projectListHTML = memberProjects.map(project => `
            <div class="project-role-item" data-project-id="${project.id}">
                <div class="project-info">
                    <h4>${this.escapeHtml(project.name)}</h4>
                    <p>Status: ${project.status}</p>
                </div>
                <div class="role-assignment">
                    <select class="form-select project-role-select"
                            data-member-id="${member.id}"
                            data-project-id="${project.id}">
                        ${roleOptions}
                    </select>
                    <script>
                        // Set current role
                        setTimeout(() => {
                            const select = document.querySelector('select[data-member-id="${member.id}"][data-project-id="${project.id}"]');
                            if (select) {
                                select.value = '${member.getProjectRole(project.id)}';
                            }
                        }, 100);
                    </script>
                </div>
            </div>
        `).join('');

        customModal.innerHTML = `
            <div class="modal-container large">
                <div class="modal-header">
                    <h2>Manage Project Roles - ${this.escapeHtml(member.name)}</h2>
                    <button class="modal-close" data-modal="customModal" title="Close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="modal-body">
                    <div class="role-instructions">
                        <p>Assign specific roles to ${this.escapeHtml(member.name)} for each project.</p>
                        <div class="role-guide">
                            <div class="role-info-item">
                                <span class="role-name">Leader:</span>
                                <span>Full project control, manage members and tasks</span>
                            </div>
                            <div class="role-info-item">
                                <span class="role-name">Frontend/Backend:</span>
                                <span>Code development with task management</span>
                            </div>
                            <div class="role-info-item">
                                <span class="role-name">Designer/UIUX:</span>
                                <span>Design and user experience work</span>
                            </div>
                            <div class="role-info-item">
                                <span class="role-name">Tester/QA:</span>
                                <span>Quality assurance and testing</span>
                            </div>
                            <div class="role-info-item">
                                <span class="role-name">Editor:</span>
                                <span>Content editing and updates</span>
                            </div>
                        </div>
                    </div>

                    ${projectListHTML ? `
                        <div class="project-roles-list">
                            ${projectListHTML}
                        </div>
                    ` : `
                        <div class="no-projects">
                            <p>${this.escapeHtml(member.name)} is not assigned to any projects yet.</p>
                        </div>
                    `}
                </div>

                <div class="modal-footer">
                    <button class="btn btn-secondary modal-close" data-modal="customModal">Done</button>
                </div>
            </div>
        `;

        // Show modal
        customModal.classList.add('show');

        // Set up event listeners for role changes
        this.setupProjectRoleHandlers();

        // Set current roles
        setTimeout(() => {
            memberProjects.forEach(project => {
                const select = customModal.querySelector(`select[data-member-id="${member.id}"][data-project-id="${project.id}"]`);
                if (select) {
                    select.value = member.getProjectRole(project.id);
                }
            });
        }, 150);
    }

    /**
     * Set up event handlers for project role changes
     */
    setupProjectRoleHandlers() {
        const roleSelects = document.querySelectorAll('.project-role-select');

        roleSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                const memberId = e.target.getAttribute('data-member-id');
                const projectId = e.target.getAttribute('data-project-id');
                const newRole = e.target.value;

                const member = this.app.getUsers().find(u => String(u.id) === String(memberId));
                if (member) {
                    member.setProjectRole(projectId, newRole);
                    this.app.saveData();

                    const project = this.app.getProjects().find(p => p.id === projectId);
                    this.app.showNotification(`Role updated: ${member.name} is now ${newRole} on ${project?.name || 'project'}`, 'success');
                }
            });
        });
    }

    /**
     * Create custom modal element if it doesn't exist
     */
    createCustomModal() {
        const modal = document.createElement('div');
        modal.id = 'customModal';
        modal.className = 'modal-overlay';
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
        document.body.appendChild(modal);
        return modal;
    }

    /**
     * Get count of projects a member is part of
     */
    getMemberProjectCount(memberId) {
        return this.app.getProjects().filter(project =>
            project.leaderId === memberId || project.memberIds.includes(memberId)
        ).length;
    }

    /**
     * Render member statistics overview
     */
    renderMemberStats(members) {
        if (members.length === 0) return '';

        const totalMembers = members.length;
        const admins = members.filter(m => m.role === 'admin').length;
        const managers = members.filter(m => m.role === 'manager').length;
        const regularMembers = members.filter(m => m.role === 'member').length;
        const totalProjects = this.app.getProjects().length;
        const activeProjects = this.app.getProjects().filter(p => p.status === 'In Progress').length;

        return `
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-users"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">${totalMembers}</div>
                    <div class="stat-label">Team Members</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-user-tie"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">${admins}</div>
                    <div class="stat-label">Administrators</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-user-cog"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">${managers}</div>
                    <div class="stat-label">Managers</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-project-diagram"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">${activeProjects}/${totalProjects}</div>
                    <div class="stat-label">Active Projects</div>
                </div>
            </div>
        `;
    }

    /**
     * Get task count for a member
     */
    getMemberTaskCount(memberId) {
        return this.app.getTasks().filter(task => task.assignedTo === memberId).length;
    }

    /**
     * Format join date for display
     */
    formatJoinDate(joinDate) {
        if (!joinDate) return 'Recently';
        return new Date(joinDate).toLocaleDateString();
    }

    /**
     * Get top 2 specializations for a member
     */
    getTop2Specializations(member) {
        // Use the existing getMemberSpecializations method but limit to 2
        const specs = this.getMemberSpecializations(member.id).split(', ');
        return specs.slice(0, 2);
    }

    /**
     * Get initials from name
     */
    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    /**
     * Get join status for display
     */
    getJoinStatus(joinDate) {
        if (!joinDate) return 'Joined recently';
        const days = Math.floor((new Date() - new Date(joinDate)) / (1000 * 60 * 60 * 24));

        if (days < 7) return 'Joined recently';
        if (days < 30) return 'Joined this month';
        if (days < 365) return `Joined ${Math.floor(days/30)} months ago`;
        return `Joined ${Math.floor(days/365)} years ago`;
    }

    /**
     * Edit member details
     */
    editMember(memberId) {
        const member = this.app.getUsers().find(u => String(u.id) === String(memberId));
        if (!member) {
            this.app.showNotification('Member not found.', 'error');
            return;
        }

        // Check permissions - only admin can edit members
        const currentUser = this.app.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            this.app.showNotification('Only administrators can edit member details.', 'error');
            return;
        }

        // Populate and show the edit modal
        this.populateMemberModal(member);
        this.showMemberModal();
    }

    /**
     * Populate the member edit modal with member data
     */
    populateMemberModal(member) {
        const nameInput = document.getElementById('memberName');
        const emailInput = document.getElementById('memberEmail');
        const roleSelect = document.getElementById('memberRole');

        if (nameInput) nameInput.value = member.name || '';
        if (emailInput) emailInput.value = member.email || '';
        if (roleSelect) roleSelect.value = member.role || 'member';

        // Store the member ID for form submission
        const form = document.getElementById('memberForm');
        if (form) {
            form.setAttribute('data-member-id', member.id);
        }

        // Clear any previous errors
        this.clearMemberFormErrors();
    }

    /**
     * Show the member edit modal
     */
    showMemberModal() {
        const modal = document.getElementById('memberModal');
        if (modal) {
            modal.classList.add('show');
        }
    }

    /**
     * Hide the member edit modal
     */
    hideMemberModal() {
        const modal = document.getElementById('memberModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    /**
     * Handle member form submission
     */
    handleMemberFormSubmit(event) {
        event.preventDefault();

        const form = event.target;
        const memberId = form.getAttribute('data-member-id');

        if (!memberId) {
            this.app.showNotification('Member ID not found.', 'error');
            return;
        }

        const member = this.app.getUsers().find(u => String(u.id) === String(memberId));
        if (!member) {
            this.app.showNotification('Member not found.', 'error');
            return;
        }

        // Get form values
        const name = document.getElementById('memberName').value.trim();
        const email = document.getElementById('memberEmail').value.trim();
        const role = document.getElementById('memberRole').value;

        // Validate form
        if (!this.validateMemberForm(name, email)) {
            return;
        }

        // Check permissions for role changes
        const currentUser = this.app.getCurrentUser();
        if (role !== member.role && currentUser.role !== 'admin') {
            this.app.showNotification('Only administrators can change member roles.', 'error');
            return;
        }

        // Update member data
        const oldName = member.name;
        const oldEmail = member.email;
        const oldRole = member.role;

        member.name = name;
        member.email = email;
        member.role = role;
        member.updatedAt = new Date().toISOString();

        // Save changes
        this.app.saveData();

        // Close modal
        this.hideMemberModal();

        // Show success notification
        this.app.showNotification(`Member "${name}" has been updated successfully.`, 'success');

        // Refresh the members view
        this.renderMembers();

        // Log the changes
        console.log(`Member updated: ${oldName} → ${name}, ${oldEmail} → ${email}, ${oldRole} → ${role}`);
    }

    /**
     * Validate member form
     */
    validateMemberForm(name, email) {
        let isValid = true;

        // Clear previous errors
        this.clearMemberFormErrors();

        // Validate name
        if (!name) {
            this.showMemberFormError('memberName', 'Name is required.');
            isValid = false;
        } else if (name.length < 2) {
            this.showMemberFormError('memberName', 'Name must be at least 2 characters.');
            isValid = false;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            this.showMemberFormError('memberEmail', 'Email is required.');
            isValid = false;
        } else if (!emailRegex.test(email)) {
            this.showMemberFormError('memberEmail', 'Please enter a valid email address.');
            isValid = false;
        } else {
            // Check if email is already used by another member
            const form = document.getElementById('memberForm');
            const memberId = form.getAttribute('data-member-id');
            const existingMember = this.app.getUsers().find(u =>
                u.email.toLowerCase() === email.toLowerCase() && String(u.id) !== String(memberId)
            );
            if (existingMember) {
                this.showMemberFormError('memberEmail', 'This email is already in use by another member.');
                isValid = false;
            }
        }

        return isValid;
    }

    /**
     * Show form error
     */
    showMemberFormError(fieldId, message) {
        const errorDiv = document.getElementById(fieldId + 'Error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }

        // Add error class to input
        const input = document.getElementById(fieldId);
        if (input) {
            input.classList.add('error');
        }
    }

    /**
     * Clear form errors
     */
    clearMemberFormErrors() {
        const errorDivs = document.querySelectorAll('#memberForm .form-error');
        errorDivs.forEach(div => {
            div.textContent = '';
            div.style.display = 'none';
        });

        // Remove error classes from inputs
        const inputs = document.querySelectorAll('#memberForm .form-input, #memberForm .form-select');
        inputs.forEach(input => {
            input.classList.remove('error');
        });
    }

    /**
     * View member profile
     */
    viewMemberProfile(memberId) {
        const member = this.app.getUsers().find(u => String(u.id) === String(memberId));
        if (!member) {
            this.app.showNotification('Member not found.', 'error');
            return;
        }

        // Create profile view modal
        const profileHTML = `
            <div class="member-profile-modal">
                <div class="profile-header">
                    <div class="member-avatar-large">
                        ${member.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="profile-info">
                        <h2>${this.escapeHtml(member.name)}</h2>
                        <p class="member-email">${this.escapeHtml(member.email)}</p>
                        <span class="member-role-badge ${member.role}">${member.role}</span>
                    </div>
                </div>

                <div class="profile-stats">
                    <div class="stat-grid">
                        <div class="stat-item">
                            <div class="stat-value">${this.getMemberProjectCount(memberId)}</div>
                            <div class="stat-label">Projects</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${this.getMemberTaskCount(memberId)}</div>
                            <div class="stat-label">Tasks</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${member.role === 'admin' ? 'Full' : member.role === 'manager' ? 'Manager' : 'Member'}</div>
                            <div class="stat-label">Role</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${this.formatJoinDate(member.joinDate)}</div>
                            <div class="stat-label">Joined</div>
                        </div>
                    </div>
                </div>

                <div class="profile-projects">
                    <h3>Recent Projects</h3>
                    ${this.renderMemberProjects(memberId)}
                </div>
            </div>
        `;

        // Show custom modal
        this.showCustomModal(`Profile: ${member.name}`, profileHTML);
    }

    /**
     * Render member's projects for profile view
     */
    renderMemberProjects(memberId) {
        const projects = this.app.getProjects().filter(project =>
            project.leaderId === memberId || project.memberIds.includes(memberId)
        ).slice(0, 5); // Limit to 5 recent projects

        if (projects.length === 0) {
            return '<p class="no-projects">No projects assigned yet.</p>';
        }

        return projects.map(project => `
            <div class="profile-project-item">
                <div class="project-name">${this.escapeHtml(project.name)}</div>
                <div class="project-meta">
                    <span class="status-badge ${project.status}">${project.status}</span>
                    ${project.leaderId === memberId ? '<span class="leader-badge">Leader</span>' : ''}
                </div>
            </div>
        `).join('');
    }

    /**
     * Show custom modal helper method
     */
    showCustomModal(title, content) {
        // Create overlay if it doesn't exist
        let overlay = document.getElementById('customModal');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'customModal';
            overlay.className = 'modal-overlay';
            document.body.appendChild(overlay);
        }

        overlay.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h2>${this.escapeHtml(title)}</h2>
                    <button class="modal-close" data-modal="customModal" title="Close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="modal-body">
                    ${content}
                </div>

                <div class="modal-footer">
                    <button class="btn btn-secondary modal-close" data-modal="customModal">Close</button>
                </div>
            </div>
        `;

        // Show modal
        overlay.classList.add('show');
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
