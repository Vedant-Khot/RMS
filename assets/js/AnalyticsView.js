/**
 * Analytics View
 * Handles rendering of analytics and dashboard components
 */
class AnalyticsView {
    constructor() {
        this.container = null;
    }

    /**
     * Render analytics dashboard
     */
    renderDashboard(data) {
        return `
            <div class="analytics-dashboard">
                <div class="stats-grid">
                    ${this.renderStatCard('Total Projects', data.totalProjects, 'fas fa-project-diagram', 'primary')}
                    ${this.renderStatCard('Active Tasks', data.activeTasks, 'fas fa-tasks', 'info')}
                    ${this.renderStatCard('Team Members', data.teamMembers, 'fas fa-users', 'success')}
                    ${this.renderStatCard('Completion Rate', `${data.completionRate}%`, 'fas fa-chart-line', 'warning')}
                </div>
                <div class="charts-container">
                    ${this.renderChart('Project Progress', 'progress-chart')}
                    ${this.renderChart('Task Distribution', 'task-chart')}
                </div>
            </div>
        `;
    }

    /**
     * Render stat card
     */
    renderStatCard(title, value, icon, color) {
        return `
            <div class="stat-card ${color}">
                <div class="stat-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="stat-content">
                    <h3 class="stat-value">${value}</h3>
                    <p class="stat-title">${title}</p>
                </div>
            </div>
        `;
    }

    /**
     * Render chart placeholder
     */
    renderChart(title, chartId) {
        return `
            <div class="chart-card">
                <div class="chart-header">
                    <h4>${title}</h4>
                </div>
                <div class="chart-body">
                    <div class="chart-placeholder" id="${chartId}">
                        <i class="fas fa-chart-bar"></i>
                        <p>Chart will be rendered here</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render empty state
     */
    renderEmptyState(title, message) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-chart-bar"></i>
                </div>
                <h3>${title}</h3>
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * Update chart data
     */
    updateChart(chartId, data) {
        const chartElement = document.getElementById(chartId);
        if (!chartElement) return;

        // Placeholder for chart update logic
        chartElement.innerHTML = `
            <i class="fas fa-chart-bar"></i>
            <p>Updated chart data</p>
        `;
    }
}
