/**
 * Members Data Service
 * Provides default user data and team members for frontend development
 * Now compatible with the Member Manager tool
 */

class MembersDataService {
    constructor() {
        // Keys for localStorage
        this.CURRENT_USER_KEY = 'rms_current_user';
        this.TEAM_MEMBERS_KEY = 'rms_team_members';

        this.defaultUser = {
            id: 1,
            name: 'Developer User',
            email: 'developer@company.com',
            role: 'admin',
            avatar: './assets/avatars/default.jpg'
        };

        // Try to load from Member Manager first, fallback to old default
        this.loadFromMemberManager();

        console.log('👤 Members Data Service initialized');
        console.log('📊 Current User:', this.getCurrentUser());
        console.log('👥 Team Members:', this.getMembers());
        window.membersDataService = this; // Make globally accessible
    }

    /**
     * Load data from Member Manager (if available)
     */
    loadFromMemberManager() {
        try {
            const currentUser = JSON.parse(localStorage.getItem(this.CURRENT_USER_KEY));
            const teamMembers = JSON.parse(localStorage.getItem(this.TEAM_MEMBERS_KEY)) || [];

            if (currentUser) {
                this.defaultUser = currentUser;
                console.log('✅ Loaded current user from Member Manager:', currentUser.name);
            }

            if (teamMembers.length > 0) {
                this.teamMembers = teamMembers;
                console.log(`✅ Loaded ${teamMembers.length} team members from Member Manager`);

                // Update RMS data for backward compatibility
                this.updateRMSData();
            } else {
                this.teamMembers = [];
                console.log('📝 No team members in Member Manager, using defaults');
            }
        } catch (error) {
            console.error('❌ Error loading from Member Manager:', error);
            this.teamMembers = [];
        }
    }

    /**
     * Update RMS app data for compatibility
     */
    updateRMSData() {
        try {
            const rmsData = JSON.parse(localStorage.getItem('rms_data')) || {};

            if (this.defaultUser) {
                rmsData.currentUser = this.defaultUser;
            }

            if (this.teamMembers) {
                rmsData.teamMembers = this.teamMembers;
            }

            localStorage.setItem('rms_data', JSON.stringify(rmsData));
            console.log('🔄 Updated RMS data for compatibility');
        } catch (error) {
            console.error('❌ Error updating RMS data:', error);
        }
    }

    /**
     * Get the current user
     */
    getCurrentUser() {
        return this.defaultUser;
    }

    /**
     * Get all team members (for RMS app usage)
     */
    getMembers() {
        return this.teamMembers || [];
    }

    /**
     * Get team member by ID
     */
    getMemberById(id) {
        return this.teamMembers?.find(member => member.id === id) || null;
    }

    /**
     * Get team member by email
     */
    getMemberByEmail(email) {
        return this.teamMembers?.find(member => member.email === email) || null;
    }

    /**
     * Refresh data from Member Manager (call this after member updates)
     */
    refresh() {
        console.log('🔄 Refreshing member data from Member Manager...');
        this.loadFromMemberManager();
    }

    /**
     * Check if members are managed by Member Manager
     */
    isMemberManagerActive() {
        return localStorage.getItem(this.CURRENT_USER_KEY) !== null ||
               (localStorage.getItem(this.TEAM_MEMBERS_KEY) &&
                JSON.parse(localStorage.getItem(this.TEAM_MEMBERS_KEY)).length > 0);
    }

    /**
     * Reset to default single user (for testing)
     */
    resetToDefault() {
        this.defaultUser = {
            id: 1,
            name: 'Developer User',
            email: 'developer@company.com',
            role: 'admin',
            avatar: './assets/avatars/default.jpg'
        };
        this.teamMembers = [];
        this.updateRMSData();
        console.log('🔄 Reset to default user');
    }

    /**
     * Check if service is loaded
     */
    isLoaded() {
        return true;
    }

    /**
     * Get user display info for RMS navbar
     */
    getUserDisplay() {
        const user = this.getCurrentUser();
        return {
            name: user?.name || 'Unknown User',
            avatar: user?.name?.charAt(0)?.toUpperCase() || 'U',
            role: user?.role || 'member'
        };
    }

    /**
     * Get all available members (including current user for project assignment)
     */
    getAllAvailableMembers() {
        const currentUser = this.getCurrentUser();
        const members = this.getMembers();

        // Return unique list with current user first
        const allMembers = [currentUser, ...members.filter(m => m.id !== currentUser.id)];
        return allMembers;
    }
}

// Initialize the service when script loads
const membersDataService = new MembersDataService();

// Make it globally accessible for easy debugging
window.membersDataService = membersDataService;
