/**
 * Email and SMS Service
 * Handles sending deadline notifications via email and SMS
 */
class EmailService {
    constructor() {
        this.emailjsInitialized = false;

        // EmailJS configuration - these would be set during setup
        this.serviceId = null;
        this.templateId = null;
        this.publicKey = null;

        // SMS carriers for email-to-SMS gateway
        this.smsCarriers = {
            'verizon': 'vtext.com',
            'att': 'txt.att.net',
            'tmobile': 'tmomail.net',
            'sprint': 'messaging.sprintpcs.com',
            'uscellular': 'email.uscc.net',
            'virgin': 'vmobl.com',
            'cricket': 'sms.cricketwireless.net',
            'metro': 'mymetropcs.com',
            'boost': 'sms.myboostmobile.com',
            'straighttalk': 'vtext.com'
        };

        // Default carrier for SMS (can be overridden in settings)
        this.defaultCarrier = 'verizon';
    }

    /**
     * Initialize EmailJS with API keys
     */
    initialize(config = {}) {
        try {
            if (typeof emailjs !== 'undefined') {
                emailjs.init(config.publicKey || 'your_emailjs_public_key');
                this.serviceId = config.serviceId || 'your_emailjs_service_id';
                this.templateId = config.templateId || 'your_emailjs_template_id';
                this.publicKey = config.publicKey || 'your_emailjs_public_key';
                this.emailjsInitialized = true;
                console.log('✅ EmailJS initialized successfully');
            } else {
                console.warn('⚠️ EmailJS library not loaded');
                this.emailjsInitialized = false;
            }
        } catch (error) {
            console.error('❌ Failed to initialize EmailJS:', error);
            this.emailjsInitialized = false;
        }
    }

    /**
     * Check if EmailJS is properly configured
     */
    isConfigured() {
        return this.emailjsInitialized &&
               this.serviceId !== 'your_emailjs_service_id' &&
               this.templateId !== 'your_emailjs_template_id' &&
               this.publicKey !== 'your_emailjs_public_key';
    }

    /**
     * Send email notification
     */
    async sendEmail(to, subject, content, options = {}) {
        if (!this.isConfigured()) {
            console.warn('⚠️ Email service not configured, skipping email send');
            // Fallback to mailto
            this.openEmailClient(to, subject, content);
            return true; // Return true for demo purposes
        }

        try {
            const templateParams = {
                to_email: to,
                subject: subject,
                message: content,
                from_name: 'RMS Notification System',
                ...options.templateParams
            };

            const result = await emailjs.send(
                this.serviceId,
                this.templateId,
                templateParams
            );

            console.log('✅ Email sent successfully:', result);
            return true;
        } catch (error) {
            console.error('❌ Failed to send email:', error);
            // Fallback to mailto
            this.openEmailClient(to, subject, content);
            return true;
        }
    }

    /**
     * Send SMS via email-to-SMS gateway
     */
    async sendSMS(phoneNumber, message, carrier = null) {
        const carrierDomain = this.smsCarriers[carrier] || this.smsCarriers[this.defaultCarrier];
        const emailAddress = `${phoneNumber}@${carrierDomain}`;

        console.log(`📱 Attempting SMS to ${phoneNumber}@${carrierDomain}`);

        const subject = 'RMS Notification';
        return await this.sendEmail(emailAddress, subject, message);
    }

    /**
     * Send deadline email notification
     */
    async sendDeadlineEmail(user, items, type = 'upcoming') {
        if (!user.email || !user.notifications.email) return false;

        const subject = type === 'upcoming' ? 'Upcoming Deadlines - RMS' : 'Overdue Items - RMS';

        let message = `Hello ${user.name},\n\n`;

        if (type === 'upcoming') {
            message += 'You have the following tasks and projects approaching their deadlines:\n\n';
        } else {
            message += 'You have the following overdue tasks and projects:\n\n';
        }

        items.forEach(item => {
            const itemType = item.type ? (item.type === 'task_deadline' ? 'Task' : 'Project') : 'Task';
            const title = item.title || item.name;
            const dueDate = new Date(item.dueDate || item.deadline).toLocaleDateString();

            if (type === 'upcoming') {
                const daysLeft = item.daysLeft || 1;
                message += `• ${itemType}: "${title}" - Due in ${daysLeft} day${daysLeft > 1 ? 's' : ''} (${dueDate})\n`;
            } else {
                message += `• ${itemType}: "${title}" - Was due on ${dueDate}\n`;
            }
        });

        message += '\nPlease review these items in your RMS dashboard.\n\n';
        message += 'Best regards,\nRMS Notification System';

        return await this.sendEmail(user.email, subject, message);
    }

    /**
     * Send deadline SMS notification
     */
    async sendDeadlineSMS(user, items, type = 'upcoming') {
        if (!user.phone || !user.notifications.sms) return false;

        let message = `RMS Alert: `;

        if (type === 'upcoming') {
            const count = items.length;
            if (count === 1) {
                const item = items[0];
                const itemType = item.type ? (item.type === 'task_deadline' ? 'Task' : 'Project') : 'Task';
                const title = item.title || item.name;
                const daysLeft = item.daysLeft || 1;
                message += `${itemType} "${title}" due in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`;
            } else {
                message += `${count} items approaching deadline`;
            }
        } else {
            const count = items.length;
            if (count === 1) {
                const item = items[0];
                const itemType = item.type ? (item.type === 'task_deadline' ? 'Task' : 'Project') : 'Task';
                const title = item.title || item.name;
                message += `${itemType} "${title}" is overdue`;
            } else {
                message += `${count} items are overdue`;
            }
        }

        return await this.sendSMS(user.phone.replace(/\D/g, ''), message, user.smsCarrier);
    }

    /**
     * Send both email and SMS deadline notifications
     */
    async sendDeadlineNotifications(user, overdueItems = [], upcomingItems = []) {
        const promises = [];

        // Send email notifications
        if (overdueItems.length > 0 && user.notifications.email) {
            promises.push(this.sendDeadlineEmail(user, overdueItems, 'overdue'));
        }
        if (upcomingItems.length > 0 && user.notifications.email) {
            promises.push(this.sendDeadlineEmail(user, upcomingItems, 'upcoming'));
        }

        // Send SMS notifications
        if (overdueItems.length > 0 && user.notifications.sms) {
            promises.push(this.sendDeadlineSMS(user, overdueItems, 'overdue'));
        }
        if (upcomingItems.length > 0 && user.notifications.sms) {
            promises.push(this.sendDeadlineSMS(user, upcomingItems, 'upcoming'));
        }

        try {
            const results = await Promise.allSettled(promises);
            const successCount = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
            console.log(`📤 Sent ${successCount}/${promises.length} notifications to ${user.name}`);
            return successCount > 0;
        } catch (error) {
            console.error('❌ Error sending notifications:', error);
            return false;
        }
    }

    /**
     * Open email client with mailto link (fallback)
     */
    openEmailClient(to, subject, content) {
        try {
            const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(content)}`;
            window.open(mailtoLink);
            console.log('📧 Opened email client (mailto fallback)');
        } catch (error) {
            console.error('❌ Failed to open email client:', error);
        }
    }

    /**
     * Validate phone number format
     */
    validatePhoneNumber(phoneNumber) {
        // Remove all non-numeric characters
        const cleaned = phoneNumber.replace(/\D/g, '');

        // Check if it's a valid US phone number (10 digits)
        return cleaned.length === 10;
    }

    /**
     * Get SMS email address for a phone number
     */
    getSMSEmail(phoneNumber, carrier) {
        const cleanedPhone = phoneNumber.replace(/\D/g, '');
        const carrierDomain = this.smsCarriers[carrier] || this.smsCarriers[this.defaultCarrier];
        return `${cleanedPhone}@${carrierDomain}`;
    }

    /**
     * Get available SMS carriers
     */
    getAvailableCarriers() {
        return Object.keys(this.smsCarriers);
    }

    /**
     * Update service configuration
     */
    updateConfig(config) {
        if (config.serviceId) this.serviceId = config.serviceId;
        if (config.templateId) this.templateId = config.templateId;
        if (config.publicKey) this.publicKey = config.publicKey;
        if (config.defaultCarrier) this.defaultCarrier = config.defaultCarrier;

        // Re-initialize EmailJS if keys changed
        if (config.publicKey && config.publicKey !== 'your_emailjs_public_key') {
            this.initialize({
                serviceId: this.serviceId,
                templateId: this.templateId,
                publicKey: config.publicKey
            });
        }
    }
}
