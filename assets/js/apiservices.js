/**
 * API Service
 * Handles external API communications
 */
class ApiService {
    constructor() {
        this.baseUrl = '';
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }

    /**
     * Make HTTP request
     */
    async request(url, options = {}) {
        try {
            const config = {
                headers: { ...this.defaultHeaders, ...options.headers },
                ...options
            };

            const response = await fetch(url, config);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    /**
     * GET request
     */
    async get(url, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;

        return this.request(fullUrl, {
            method: 'GET'
        });
    }

    /**
     * POST request
     */
    async post(url, data = {}) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request
     */
    async put(url, data = {}) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     */
    async delete(url) {
        return this.request(url, {
            method: 'DELETE'
        });
    }

    /**
     * Upload file
     */
    async uploadFile(url, file, additionalData = {}) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            Object.keys(additionalData).forEach(key => {
                formData.append(key, additionalData[key]);
            });

            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Upload failed! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('File upload failed:', error);
            throw error;
        }
    }

    /**
     * Set authorization token
     */
    setAuthToken(token) {
        this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    /**
     * Remove authorization token
     */
    removeAuthToken() {
        delete this.defaultHeaders['Authorization'];
    }

    /**
     * Check if API is available
     */
    async ping() {
        try {
            // Try to make a simple request to check connectivity
            const response = await fetch(this.baseUrl + '/ping', {
                method: 'GET',
                headers: this.defaultHeaders
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}
