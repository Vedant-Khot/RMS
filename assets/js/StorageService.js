/**
 * Storage Service
 * Handles data persistence using localStorage with error handling
 */
class StorageService {
    constructor() {
        this.storageKey = 'rms_data';
        this.isAvailable = this.checkStorageAvailability();
    }

    /**
     * Check if localStorage is available
     */
    checkStorageAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            console.warn('localStorage not available:', error);
            return false;
        }
    }

    /**
     * Load data from storage
     */
    load() {
        if (!this.isAvailable) {
            console.warn('Storage not available, using default data');
            return this.getDefaultData();
        }

        try {
            const data = localStorage.getItem(this.storageKey);
            if (!data) {
                return this.getDefaultData();
            }

            const parsedData = JSON.parse(data);

            // Convert plain objects back to model instances
            return {
                users: parsedData.users?.map(user => new User(user)) || [],
                projects: parsedData.projects?.map(project => new Project(project)) || [],
                tasks: parsedData.tasks?.map(task => new Task(task)) || [],
                notifications: parsedData.notifications?.map(notif => new Notification(notif)) || [],
                currentUser: parsedData.currentUser ? new User(parsedData.currentUser) : null,
                settings: parsedData.settings || {},
                lastUpdated: parsedData.lastUpdated || new Date().toISOString()
            };
        } catch (error) {
            console.error('Error loading data from storage:', error);
            return this.getDefaultData();
        }
    }

    /**
     * Save data to storage
     */
    save(data) {
        if (!this.isAvailable) {
            console.warn('Storage not available, data not saved');
            return false;
        }

        try {
            // Convert model instances to plain objects for storage
            const dataToStore = {
                users: data.users?.map(user => user.toJSON()) || [],
                projects: data.projects?.map(project => project.toJSON()) || [],
                tasks: data.tasks?.map(task => task.toJSON()) || [],
                notifications: data.notifications?.map(notif => notif.toJSON()) || [],
                currentUser: data.currentUser?.toJSON() || null,
                settings: data.settings || {},
                lastUpdated: new Date().toISOString()
            };

            localStorage.setItem(this.storageKey, JSON.stringify(dataToStore));
            return true;
        } catch (error) {
            console.error('Error saving data to storage:', error);
            return false;
        }
    }

    /**
     * Clear all data from storage
     */
    clear() {
        if (!this.isAvailable) {
            return false;
        }

        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }

    /**
     * Get default data structure
     */
    getDefaultData() {
        // Note: Users are now managed by MembersDataService for database integration
        // For backward compatibility, we still provide an empty array here
        // The actual member data will be fetched asynchronously by the services that need it
        const users = [];

        // No current user set by default - will be set after user registration/login
        const currentUserInstance = null;

        return {
            users: users,
            projects: [],
            tasks: [],
            notifications: [],
            currentUser: currentUserInstance,
            settings: {
                theme: 'light',
                color: 'blue',
                notifications: true,
                autoSave: true
            },
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Export data as JSON file
     */
    exportData(data) {
        try {
            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `rms-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error('Error exporting data:', error);
            return false;
        }
    }

    /**
     * Import data from JSON file
     */
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);

                    // Validate imported data structure
                    if (!this.validateImportData(data)) {
                        reject(new Error('Invalid data format'));
                        return;
                    }

                    resolve(data);
                } catch (error) {
                    reject(new Error('Error parsing file: ' + error.message));
                }
            };

            reader.onerror = () => {
                reject(new Error('Error reading file'));
            };

            reader.readAsText(file);
        });
    }

    /**
     * Validate imported data structure
     */
    validateImportData(data) {
        return (
            data &&
            typeof data === 'object' &&
            Array.isArray(data.users) &&
            Array.isArray(data.projects) &&
            Array.isArray(data.tasks) &&
            Array.isArray(data.notifications)
        );
    }

    /**
     * Get storage usage information
     */
    getStorageInfo() {
        if (!this.isAvailable) {
            return null;
        }

        try {
            const data = localStorage.getItem(this.storageKey);
            if (!data) {
                return {
                    used: 0,
                    available: '5MB',
                    percentage: 0
                };
            }

            const usedBytes = new Blob([data]).size;
            const usedKB = Math.round(usedBytes / 1024);

            return {
                used: usedKB + ' KB',
                usedBytes: usedBytes,
                available: '5 MB (estimated)',
                percentage: Math.round((usedBytes / (5 * 1024 * 1024)) * 100)
            };
        } catch (error) {
            console.error('Error getting storage info:', error);
            return null;
        }
    }
}
