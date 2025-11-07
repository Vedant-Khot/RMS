/**
 * Data Formatters
 * Functions for formatting various types of data for display
 */

/**
 * Format currency value
 */
function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
    if (amount === null || amount === undefined) return '';

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
    }).format(amount);
}

/**
 * Format percentage
 */
function formatPercentage(value, decimals = 1) {
    if (value === null || value === undefined) return '';

    return `${parseFloat(value).toFixed(decimals)}%`;
}

/**
 * Format number with commas
 */
function formatNumber(num, decimals = 0) {
    if (num === null || num === undefined) return '';

    return parseFloat(num).toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Format file size in human readable format
 */
function formatFileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format duration in milliseconds to human readable format
 */
function formatDuration(ms) {
    if (ms === null || ms === undefined) return '';

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

/**
 * Format date for display
 */
function formatDate(date, options = {}) {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };

    return d.toLocaleDateString(undefined, { ...defaultOptions, ...options });
}

/**
 * Format date and time for display
 */
function formatDateTime(date, options = {}) {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };

    return d.toLocaleDateString(undefined, { ...defaultOptions, ...options });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(date) {
    if (!date) return '';

    const now = new Date();
    const target = new Date(date);
    const diffMs = now - target;

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
    if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
    return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
}

/**
 * Format phone number
 */
function formatPhoneNumber(phone) {
    if (!phone) return '';

    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Format US phone numbers
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    // Format international phone numbers (basic)
    if (cleaned.length > 10) {
        return `+${cleaned.slice(0, cleaned.length - 10)} (${cleaned.slice(-10, -7)}) ${cleaned.slice(-7, -4)}-${cleaned.slice(-4)}`;
    }

    return phone;
}

/**
 * Format credit card number
 */
function formatCreditCard(cardNumber) {
    if (!cardNumber) return '';

    const cleaned = cardNumber.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{4})(\d{4})?(\d{4})?(\d{4})?$/);

    if (match) {
        return match.slice(1, 5).filter(Boolean).join(' ');
    }

    return cardNumber;
}

/**
 * Format list as human readable string
 */
function formatList(items, conjunction = 'and') {
    if (!items || items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;

    const allButLast = items.slice(0, -1).join(', ');
    const last = items[items.length - 1];

    return `${allButLast}, ${conjunction} ${last}`;
}

/**
 * Format initials from name
 */
function formatInitials(name) {
    if (!name) return '';

    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
}

/**
 * Format name for display (Last, First)
 */
function formatNameLastFirst(firstName, lastName) {
    if (!firstName && !lastName) return '';
    if (!firstName) return lastName;
    if (!lastName) return firstName;

    return `${lastName}, ${firstName}`;
}

/**
 * Format address for display
 */
function formatAddress(address) {
    if (!address) return '';

    const parts = [
        address.street,
        address.city,
        address.state,
        address.zipCode,
        address.country
    ].filter(Boolean);

    return parts.join(', ');
}

/**
 * Format coordinates as degrees, minutes, seconds
 */
function formatCoordinates(lat, lng, format = 'dms') {
    if (format === 'decimal') {
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }

    // Convert to degrees, minutes, seconds
    const latDms = this.decimalToDMS(lat);
    const lngDms = this.decimalToDMS(lng);

    return `${latDms} ${lat >= 0 ? 'N' : 'S'}, ${lngDms} ${lng >= 0 ? 'E' : 'W'}`;
}

/**
 * Convert decimal degrees to degrees, minutes, seconds
 */
function decimalToDMS(decimal) {
    const degrees = Math.floor(Math.abs(decimal));
    const minutes = Math.floor((Math.abs(decimal) - degrees) * 60);
    const seconds = (((Math.abs(decimal) - degrees) * 60 - minutes) * 60).toFixed(1);

    return `${degrees}° ${minutes}' ${seconds}"`;
}

/**
 * Format bytes as human readable with binary (1024) or decimal (1000) units
 */
function formatBytes(bytes, useBinaryUnits = true) {
    if (bytes === 0) return '0 Bytes';

    const base = useBinaryUnits ? 1024 : 1000;
    const units = useBinaryUnits
        ? ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB']
        : ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const k = base;
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + units[i];
}

/**
 * Format text with proper capitalization
 */
function formatTitle(text) {
    if (!text) return '';

    return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Format slug from text (URL friendly)
 */
function formatSlug(text) {
    if (!text) return '';

    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Format HTML for safe display (basic sanitization)
 */
function formatHtml(html, options = {}) {
    if (!html) return '';

    // Basic HTML sanitization - remove script tags and dangerous attributes
    let sanitized = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/javascript:/gi, '');

    if (options.truncate) {
        sanitized = truncateText(sanitized.replace(/<[^>]*>/g, ''), options.truncate);
    }

    return sanitized;
}

/**
 * Truncate text with ellipsis
 */
function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
}
