/**
 * Central User Configuration
 * All user data is defined here for easy management and database integration
 */

// User data structure constants
const USER_ROLES = {
    ADMIN: 'admin',
    MEMBER: 'member',
    MANAGER: 'manager'
};

const USER_STATUSES = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended'
};

// Main users configuration
// This is the central place to manage all user data
// Contains all app users for easy database integration
const USERS_CONFIG = [
    // TODO: This will be populated from database/API
    // For now, leave empty to avoid hardcoded member data
];

// Convert users_config to the format expected by the app
function getUsersFromConfig() {
    return USERS_CONFIG.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.status === USER_STATUSES.ACTIVE,
        projectRoles: {},
        avatar: user.avatar,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
    }));
}

function getCurrentUserFromConfig() {
    return getUsersFromConfig().find(user => user.id === 'user_default') || getUsersFromConfig()[0];
}

// Database integration helper functions
function addUser(userData) {
    const newUser = {
        id: `user_${Date.now()}`,
        name: userData.name,
        email: userData.email,
        role: userData.role || USER_ROLES.MEMBER,
        status: USER_STATUSES.ACTIVE,
        avatar: userData.avatar || null,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        ...userData
    };

    USERS_CONFIG.push(newUser);
    return newUser;
}

function updateUser(userId, updates) {
    const userIndex = USERS_CONFIG.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
        USERS_CONFIG[userIndex] = { ...USERS_CONFIG[userIndex], ...updates };
        return USERS_CONFIG[userIndex];
    }
    return null;
}

function removeUser(userId) {
    const userIndex = USERS_CONFIG.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
        return USERS_CONFIG.splice(userIndex, 1)[0];
    }
    return null;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    // Node.js/CommonJS
    module.exports = {
        USER_ROLES,
        USER_STATUSES,
        USERS_CONFIG,
        getUsersFromConfig,
        getCurrentUserFromConfig,
        addUser,
        updateUser,
        removeUser
    };
} else {
    // Browser global
    window.UsersConfig = {
        USER_ROLES,
        USER_STATUSES,
        USERS_CONFIG,
        getUsersFromConfig,
        getCurrentUserFromConfig,
        addUser,
        updateUser,
        removeUser
    };
}
