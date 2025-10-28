// =============================================================================
// ColdChain Pro - Professional Cold Chain Monitoring System
// Enhanced JavaScript with Performance Optimization & Rich Insights
// Version: 2.0 | Optimized for Zero Lag & Professional UX
// =============================================================================

class ColdChainApp {
    constructor() {
        this.API_BASE = 'https://my-coldchain-backend.onrender.com/api';
        this.currentPage = 'dashboard';
        this.data = {
            latest: {},
            history: [],
            alerts: []
        };
        this.charts = {};
        this.pollingInterval = null;
        this.connectionStatus = 'disconnected';
        this.updateQueue = [];
        this.isUpdating = false;
        this.performanceMetrics = {
            apiCalls: 0,
            avgResponseTime: 0,
            lastUpdate: null
        };
        
        // Performance optimization: Debounce timers
        this.debounceTimers = {};
        
        // Cache for DOM elements (performance optimization)
        this.domCache = {};
        
        this.init();
    }

    // Initialize the application
    init() {
        this.showLoadingScreen();
        this.setupEventListeners();
        this.initializeCharts();
        this.startDataPolling();
        this.updateClock();
        
        // Hide loading screen after initialization
        setTimeout(() => {
            this.hideLoadingScreen();
        }, 2000);
    }

    // Loading screen management
    showLoadingScreen() {
        document.getElementById('loadingScreen').classList.remove('hidden');
    }

    hideLoadingScreen() {
        document.getElementById('loadingScreen').classList.add('hidden');
    }

    // Setup all event listeners
    setupEventListeners() {
        // Sidebar navigation
        this.setupSidebarNavigation();
        
        // Header actions
        this.setupHeaderActions();
        
        // Form submissions
        this.setupFormHandlers();
        
        // Responsive sidebar toggle
        this.setupResponsiveHandlers();
    }

    // Sidebar navigation setup
    setupSidebarNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigateToPage(page);
            });
        });

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                document.getElementById('sidebar').classList.toggle('collapsed');
            });
        }
    }

    // Navigate to different pages with smooth transitions
    navigateToPage(pageId) {
        // Prevent rapid page switching
        if (this.isNavigating) return;
        this.isNavigating = true;
        
        // Update active nav item with smooth transition
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeNav = document.querySelector(`[data-page="${pageId}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
        }

        // Fade out current page
        const currentPages = document.querySelectorAll('.page.active');
        currentPages.forEach(page => {
            page.style.opacity = '0';
            setTimeout(() => {
                page.classList.remove('active');
            }, 200);
        });

        // Fade in new page
        setTimeout(() => {
            const newPage = document.getElementById(`${pageId}Page`);
            if (newPage) {
                newPage.classList.add('active');
                requestAnimationFrame(() => {
                    newPage.style.opacity = '1';
                });
            }

            // Update page title with animation
            const pageTitle = this.getCachedElement('pageTitle');
            const titles = {
                dashboard: 'Dashboard Overview',
                analytics: 'Data Analytics & Insights',
                alerts: 'Alerts & Reports',
                tracking: 'Real-time Location Tracking',
                settings: 'System Configuration'
            };
            
            if (pageTitle) {
                pageTitle.style.opacity = '0';
                setTimeout(() => {
                    pageTitle.textContent = titles[pageId] || 'Dashboard';
                    pageTitle.style.opacity = '1';
                }, 150);
            }

            this.currentPage = pageId;
            this.isNavigating = false;

            // Initialize page-specific functionality
            this.initializePageFeatures(pageId);
            
            // Log page view for analytics
            this.logPageView(pageId);
        }, 200);
    }

    // Initialize features for specific pages with rich insights
    initializePageFeatures(pageId) {
        switch (pageId) {
            case 'dashboard':
                this.updateDashboardInsights();
                break;
            case 'analytics':
                this.initializeAnalyticsCharts();
                this.updateAnalyticsInsights();
                break;
            case 'tracking':
                this.initializeMap();
                this.updateTrackingInsights();
                break;
            case 'alerts':
                this.updateAlertsInsights();
                break;
            case 'settings':
                this.loadSettings();
                this.updateSystemInfo();
                break;
        }
    }

    // Header actions setup
    setupHeaderActions() {
        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.fetchAllData();
                this.showToast('Data refreshed successfully', 'success');
            });
        }

        // Export button
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        // Fullscreen button
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }
        
        // Chart time range buttons
        this.setupChartControls();
    }
    
    // Setup chart control buttons
    setupChartControls() {
        const chartButtons = document.querySelectorAll('.chart-controls .btn');
        chartButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all buttons
                chartButtons.forEach(b => b.classList.remove('active'));
                // Add active to clicked button
                e.currentTarget.classList.add('active');
                
                // Get time range and update chart
                const timeRange = e.currentTarget.dataset.timerange;
                this.updateChartTimeRange(timeRange);
            });
        });
        
        // Tab buttons for analytics
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                tabButtons.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                const tab = e.currentTarget.dataset.tab;
                this.switchAnalyticsTab(tab);
            });
        });
    }
    
    // Update chart based on time range
    updateChartTimeRange(range) {
        let dataPoints = 20; // default
        switch(range) {
            case '1h':
                dataPoints = 12; // 5-minute intervals
                break;
            case '6h':
                dataPoints = 36;
                break;
            case '24h':
                dataPoints = 48;
                break;
        }
        
        if (this.charts.realtime && this.data.history.length > 0) {
            const recentData = this.data.history.slice(-dataPoints);
            this.charts.realtime.data.labels = recentData.map(item => 
                new Date(item.timestamp).toLocaleTimeString()
            );
            this.charts.realtime.data.datasets[0].data = recentData.map(item => item.temperature);
            this.charts.realtime.update('none'); // Update without animation for better performance
        }
    }
    
    // Switch analytics tab
    switchAnalyticsTab(tab) {
        // This can be extended to show different datasets
        console.log(`Switched to ${tab} tab`);
        this.showToast(`Viewing ${tab} data`, 'info');
    }

    // Form handlers setup
    setupFormHandlers() {
        // Settings form
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        const resetSettingsBtn = document.getElementById('resetSettingsBtn');
        if (resetSettingsBtn) {
            resetSettingsBtn.addEventListener('click', () => {
                this.resetSettings();
            });
        }
    }

    // Responsive handlers
    setupResponsiveHandlers() {
        // Mobile sidebar overlay
        if (window.innerWidth <= 1024) {
            const sidebar = document.getElementById('sidebar');
            document.addEventListener('click', (e) => {
                if (!sidebar.contains(e.target) && sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                }
            });
        }
    }

    // Data fetching and polling with performance tracking
    async fetchAllData() {
        if (this.isUpdating) {
            return; // Prevent concurrent updates
        }
        
        this.isUpdating = true;
        const startTime = performance.now();
        
        try {
            const results = await Promise.all([
                this.fetchStatus(),
                this.fetchHistory(),
                this.fetchAlerts()
            ]);
            
            const endTime = performance.now();
            this.updatePerformanceMetrics(endTime - startTime);
            this.updateConnectionStatus('connected');
        } catch (error) {
            console.error('Error fetching data:', error);
            this.updateConnectionStatus('disconnected');
            this.showToast('Connection error. Retrying...', 'warning');
        } finally {
            this.isUpdating = false;
        }
    }

    async fetchStatus() {
        try {
            const response = await fetch(`${this.API_BASE}/status`);
            if (response.ok) {
                this.data.latest = await response.json();
                this.updateDashboard();
            }
        } catch (error) {
            console.error('Error fetching status:', error);
        }
    }

    async fetchHistory() {
        try {
            const response = await fetch(`${this.API_BASE}/history`);
            if (response.ok) {
                this.data.history = await response.json();
                this.updateCharts();
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    }

    async fetchAlerts() {
        try {
            const response = await fetch(`${this.API_BASE}/alerts`);
            if (response.ok) {
                this.data.alerts = await response.json();
                this.updateAlertsDisplay();
            }
        } catch (error) {
            console.error('Error fetching alerts:', error);
        }
    }

    // Start data polling
    startDataPolling() {
        this.fetchAllData();
        this.pollingInterval = setInterval(() => {
            this.fetchAllData();
        }, 5000); // Poll every 5 seconds
    }

    // Update connection status
    updateConnectionStatus(status) {
        this.connectionStatus = status;
        const indicator = document.getElementById('connectionIndicator');
        const text = document.getElementById('connectionText');
        const connectionStatus = document.querySelector('.connection-status');
        
        if (status === 'connected') {
            indicator.className = 'fas fa-circle';
            text.textContent = 'Connected';
            connectionStatus.classList.add('connected');
            connectionStatus.classList.remove('disconnected');
        } else {
            indicator.className = 'fas fa-circle';
            text.textContent = 'Disconnected';
            connectionStatus.classList.add('disconnected');
            connectionStatus.classList.remove('connected');
        }
    }

    // Update dashboard with latest data (optimized with batched DOM updates)
    updateDashboard() {
        const data = this.data.latest;
        
        // Batch DOM updates using DocumentFragment for better performance
        requestAnimationFrame(() => {
            // Update current readings
            this.updateElement('currentTemp', data.temperature ? `${data.temperature.toFixed(1)}°C` : '--°C');
            this.updateElement('currentHumidity', data.humidity ? `${data.humidity.toFixed(1)}%` : '--%');
            
            // Update RSL with visual feedback
            const rslValue = data.predicted_rsl_days ? data.predicted_rsl_days.toFixed(1) : '--';
            this.updateElement('rslValue', rslValue);
            
            // Update RSL progress bar with smooth animation
            const rslProgress = this.getCachedElement('rslProgress');
            if (rslProgress && data.predicted_rsl_days) {
                const percentage = Math.max(0, Math.min(100, (data.predicted_rsl_days / 30) * 100));
                rslProgress.style.transition = 'width 0.5s ease-in-out';
                rslProgress.style.width = `${percentage}%`;
                
                // Color code based on RSL
                if (percentage < 30) {
                    rslProgress.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                } else if (percentage < 60) {
                    rslProgress.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
                } else {
                    rslProgress.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                }
            }
            
            // Update KPIs with formatting
            this.updateElement('avgTemp', data.avg_temp ? `${data.avg_temp.toFixed(1)}°C` : '--°C');
            this.updateElement('journeyTime', data.journey_time_hours ? `${data.journey_time_hours.toFixed(1)}h` : '--h');
            
            const compliance = this.calculateCompliance();
            this.updateElement('tempCompliance', compliance !== '--' ? `${compliance}%` : '--');
            
            this.updateElement('alertCount', this.data.alerts.length.toString());
            
            // Update status indicators with smooth transitions
            this.updateSystemStatus(data.status);
            
            // Update last update time
            const now = new Date();
            this.updateElement('lastUpdate', `Last updated: ${now.toLocaleTimeString()}`);
            
            // Update performance metrics display
            this.updatePerformanceDisplay();
        });
    }

    // Update an element's text content safely
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    // Calculate temperature compliance percentage
    calculateCompliance() {
        if (this.data.history.length === 0) return '--';
        
        const inRangeCount = this.data.history.filter(reading => 
            reading.temperature >= 15 && reading.temperature <= 25
        ).length;
        
        return Math.round((inRangeCount / this.data.history.length) * 100);
    }

    // Update system status indicators
    updateSystemStatus(status) {
        const statusIndicator = document.getElementById('systemStatus');
        const statusText = document.getElementById('systemStatusText');
        const globalStatus = document.getElementById('globalStatus');
        
        if (statusIndicator && statusText) {
            statusIndicator.className = 'fas fa-circle';
            
            switch (status) {
                case 'NORMAL':
                    statusIndicator.style.color = 'var(--success-green)';
                    statusText.textContent = 'Normal';
                    if (globalStatus) {
                        globalStatus.style.background = 'var(--success-green)';
                        globalStatus.querySelector('span').textContent = 'Normal';
                    }
                    break;
                case 'ALERT':
                    statusIndicator.style.color = 'var(--danger-red)';
                    statusText.textContent = 'Alert';
                    if (globalStatus) {
                        globalStatus.style.background = 'var(--danger-red)';
                        globalStatus.querySelector('span').textContent = 'Alert';
                    }
                    break;
                default:
                    statusIndicator.style.color = 'var(--warning-yellow)';
                    statusText.textContent = 'Unknown';
                    if (globalStatus) {
                        globalStatus.style.background = 'var(--warning-yellow)';
                        globalStatus.querySelector('span').textContent = 'Initializing';
                    }
            }
        }
    }

    // Initialize charts
    initializeCharts() {
        this.initializeRealtimeChart();
    }

    // Initialize real-time temperature chart
    initializeRealtimeChart() {
        const ctx = document.getElementById('realtimeChart');
        if (!ctx) return;

        this.charts.realtime = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Temperature (°C)',
                    data: [],
                    borderColor: 'rgb(37, 99, 235)',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Initialize analytics charts
    initializeAnalyticsCharts() {
        const ctx = document.getElementById('analyticsChart');
        if (!ctx || this.charts.analytics) return;

        this.charts.analytics = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Temperature',
                    data: [],
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                }, {
                    label: 'Humidity',
                    data: [],
                    borderColor: 'rgb(6, 182, 212)',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

    // Update charts with latest data
    updateCharts() {
        if (this.charts.realtime) {
            const recentData = this.data.history.slice(-20); // Last 20 readings
            
            this.charts.realtime.data.labels = recentData.map(item => 
                new Date(item.timestamp).toLocaleTimeString()
            );
            this.charts.realtime.data.datasets[0].data = recentData.map(item => item.temperature);
            this.charts.realtime.update();
        }

        if (this.charts.analytics) {
            const recentData = this.data.history.slice(-50); // Last 50 readings
            
            this.charts.analytics.data.labels = recentData.map(item => 
                new Date(item.timestamp).toLocaleTimeString()
            );
            this.charts.analytics.data.datasets[0].data = recentData.map(item => item.temperature);
            this.charts.analytics.data.datasets[1].data = recentData.map(item => item.humidity);
            this.charts.analytics.update();
        }
    }

    // Initialize map for tracking page
    initializeMap() {
        if (typeof L === 'undefined') return;
        
        const mapContainer = document.getElementById('trackingMap');
        if (!mapContainer || this.map) return;

        // Default coordinates (can be updated with real data)
        const defaultLat = 27.7172;
        const defaultLng = 85.3240;

        this.map = L.map('trackingMap').setView([defaultLat, defaultLng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        this.marker = L.marker([defaultLat, defaultLng]).addTo(this.map)
            .bindPopup('Container Location')
            .openPopup();

        // Update coordinates display
        this.updateElement('coordinates', `${defaultLat.toFixed(6)}, ${defaultLng.toFixed(6)}`);
        this.updateElement('currentPosition', 'Kathmandu, Nepal');
    }

    // Update alerts display
    updateAlertsDisplay() {
        // Update alert counts
        const criticalAlerts = this.data.alerts.filter(alert => 
            alert.type.includes('High Temperature') || alert.type.includes('Critical')
        ).length;
        const warningAlerts = this.data.alerts.filter(alert => 
            alert.type.includes('Low Temperature') || alert.type.includes('Warning')
        ).length;
        const resolvedAlerts = this.data.alerts.filter(alert => alert.end_time).length;

        this.updateElement('criticalAlerts', criticalAlerts.toString());
        this.updateElement('warningAlerts', warningAlerts.toString());
        this.updateElement('resolvedAlerts', resolvedAlerts.toString());

        // Update alert timeline
        const timeline = document.getElementById('alertTimeline');
        if (timeline) {
            if (this.data.alerts.length === 0) {
                timeline.innerHTML = `
                    <div class="no-alerts">
                        <i class="fas fa-check-circle"></i>
                        <span>No active alerts</span>
                    </div>
                `;
            } else {
                timeline.innerHTML = this.data.alerts.map(alert => `
                    <div class="alert-item ${this.getAlertClass(alert.type)}">
                        <div class="alert-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="alert-content">
                            <div class="alert-title">${alert.type}</div>
                            <div class="alert-time">
                                Started: ${new Date(alert.start_time).toLocaleString()}
                                ${alert.end_time ? `| Ended: ${new Date(alert.end_time).toLocaleString()}` : '| Ongoing'}
                            </div>
                            <div class="alert-value">Peak Value: ${alert.peak_value}°C</div>
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    // Get CSS class for alert type
    getAlertClass(alertType) {
        if (alertType.includes('High Temperature')) return 'critical';
        if (alertType.includes('Low Temperature')) return 'warning';
        return 'info';
    }

    // Clock update
    updateClock() {
        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleString();
            this.updateElement('currentTime', timeString);
        };

        updateTime();
        setInterval(updateTime, 1000);
    }

    // Settings management
    loadSettings() {
        const settings = localStorage.getItem('coldchain-settings');
        if (settings) {
            const parsedSettings = JSON.parse(settings);
            
            // Load settings into form
            this.updateElement('tempUnit', parsedSettings.tempUnit || 'celsius');
            this.updateElement('highTempThreshold', parsedSettings.highTempThreshold || '25');
            this.updateElement('lowTempThreshold', parsedSettings.lowTempThreshold || '15');
        }
    }

    saveSettings() {
        const settings = {
            tempUnit: document.getElementById('tempUnit')?.value || 'celsius',
            highTempThreshold: document.getElementById('highTempThreshold')?.value || '25',
            lowTempThreshold: document.getElementById('lowTempThreshold')?.value || '15'
        };

        localStorage.setItem('coldchain-settings', JSON.stringify(settings));
        this.showToast('Settings saved successfully', 'success');
    }

    resetSettings() {
        localStorage.removeItem('coldchain-settings');
        this.loadSettings();
        this.showToast('Settings reset to default', 'info');
    }

    // Utility functions
    exportData() {
        const dataToExport = {
            timestamp: new Date().toISOString(),
            latest: this.data.latest,
            history: this.data.history,
            alerts: this.data.alerts
        };

        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `coldchain-data-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('Data exported successfully', 'success');
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    // Toast notification system
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <strong>${this.getToastIcon(type)} ${this.getToastTitle(type)}</strong>
                <p>${message}</p>
            </div>
        `;

        container.appendChild(toast);

        // Auto remove after 4 seconds
        setTimeout(() => {
            toast.remove();
        }, 4000);
    }

    getToastIcon(type) {
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-exclamation-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };
        return icons[type] || icons.info;
    }

    getToastTitle(type) {
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Information'
        };
        return titles[type] || 'Notification';
    }

    // =========================================================================
    // PERFORMANCE OPTIMIZATION UTILITIES
    // =========================================================================
    
    // DOM element caching for better performance
    getCachedElement(id) {
        if (!this.domCache[id]) {
            this.domCache[id] = document.getElementById(id);
        }
        return this.domCache[id];
    }
    
    // Debounce function to prevent excessive calls
    debounce(func, wait, key) {
        return (...args) => {
            clearTimeout(this.debounceTimers[key]);
            this.debounceTimers[key] = setTimeout(() => {
                func.apply(this, args);
            }, wait);
        };
    }
    
    // Update performance metrics
    updatePerformanceMetrics(responseTime) {
        this.performanceMetrics.apiCalls++;
        this.performanceMetrics.avgResponseTime = 
            (this.performanceMetrics.avgResponseTime * (this.performanceMetrics.apiCalls - 1) + responseTime) / 
            this.performanceMetrics.apiCalls;
        this.performanceMetrics.lastUpdate = new Date();
    }
    
    // Display performance metrics
    updatePerformanceDisplay() {
        const perfDisplay = this.getCachedElement('performanceMetrics');
        if (perfDisplay && this.performanceMetrics.lastUpdate) {
            const avgTime = this.performanceMetrics.avgResponseTime.toFixed(0);
            perfDisplay.textContent = `API Response: ${avgTime}ms | Uptime: ${this.getUptime()}`;
        }
    }
    
    // Calculate application uptime
    getUptime() {
        if (!this.startTime) {
            this.startTime = new Date();
        }
        const uptime = new Date() - this.startTime;
        const minutes = Math.floor(uptime / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        return `${minutes}m`;
    }
    
    // Log page view for analytics
    logPageView(pageId) {
        if (!this.pageViews) {
            this.pageViews = {};
        }
        this.pageViews[pageId] = (this.pageViews[pageId] || 0) + 1;
        console.log(`📊 Page View: ${pageId} (${this.pageViews[pageId]} views)`);
    }

    // =========================================================================
    // RICH INSIGHTS & ANALYTICS
    // =========================================================================
    
    // Dashboard insights with AI-like recommendations
    updateDashboardInsights() {
        const insights = this.generateDashboardInsights();
        const insightContainer = this.getCachedElement('dashboardInsights');
        
        if (insightContainer && insights.length > 0) {
            insightContainer.innerHTML = `
                <div class="insights-panel">
                    <h3><i class="fas fa-lightbulb"></i> Smart Insights</h3>
                    ${insights.map(insight => `
                        <div class="insight-item ${insight.type}">
                            <i class="${insight.icon}"></i>
                            <div>
                                <strong>${insight.title}</strong>
                                <p>${insight.message}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }
    
    // Generate intelligent insights based on data patterns
    generateDashboardInsights() {
        const insights = [];
        const data = this.data.latest;
        const history = this.data.history;
        
        if (!data.temperature) return insights;
        
        // Temperature trend analysis
        if (history.length > 5) {
            const recentTemps = history.slice(-5).map(h => h.temperature);
            const trend = this.calculateTrend(recentTemps);
            
            if (trend > 0.5) {
                insights.push({
                    type: 'warning',
                    icon: 'fas fa-arrow-up',
                    title: 'Rising Temperature Detected',
                    message: `Temperature has increased by ${trend.toFixed(1)}°C in the last 5 readings. Monitor closely.`
                });
            } else if (trend < -0.5) {
                insights.push({
                    type: 'info',
                    icon: 'fas fa-arrow-down',
                    title: 'Temperature Decreasing',
                    message: `Temperature has dropped by ${Math.abs(trend).toFixed(1)}°C. Conditions improving.`
                });
            } else {
                insights.push({
                    type: 'success',
                    icon: 'fas fa-check-circle',
                    title: 'Stable Temperature',
                    message: 'Temperature remains stable. Good cold chain management.'
                });
            }
        }
        
        // RSL prediction insights
        if (data.predicted_rsl_days) {
            if (data.predicted_rsl_days < 10) {
                insights.push({
                    type: 'critical',
                    icon: 'fas fa-exclamation-triangle',
                    title: 'Critical RSL Alert',
                    message: `Only ${data.predicted_rsl_days.toFixed(1)} days of shelf life remaining. Expedite delivery!`
                });
            } else if (data.predicted_rsl_days < 20) {
                insights.push({
                    type: 'warning',
                    icon: 'fas fa-clock',
                    title: 'Moderate RSL',
                    message: `${data.predicted_rsl_days.toFixed(1)} days of shelf life. Plan delivery within 2 weeks.`
                });
            } else {
                insights.push({
                    type: 'success',
                    icon: 'fas fa-leaf',
                    title: 'Excellent RSL',
                    message: `${data.predicted_rsl_days.toFixed(1)} days of shelf life. Products are in optimal condition.`
                });
            }
        }
        
        // Humidity insights
        if (data.humidity) {
            if (data.humidity > 80) {
                insights.push({
                    type: 'warning',
                    icon: 'fas fa-tint',
                    title: 'High Humidity',
                    message: `Humidity at ${data.humidity.toFixed(1)}%. Risk of condensation. Check ventilation.`
                });
            } else if (data.humidity < 50) {
                insights.push({
                    type: 'info',
                    icon: 'fas fa-wind',
                    title: 'Low Humidity',
                    message: `Humidity at ${data.humidity.toFixed(1)}%. Dry conditions detected.`
                });
            }
        }
        
        // Journey time insights
        if (data.journey_time_hours) {
            const efficiency = this.calculateJourneyEfficiency(data.journey_time_hours);
            insights.push({
                type: efficiency > 0.8 ? 'success' : 'info',
                icon: 'fas fa-truck',
                title: 'Journey Progress',
                message: `${data.journey_time_hours.toFixed(1)}h elapsed. Efficiency: ${(efficiency * 100).toFixed(0)}%`
            });
        }
        
        return insights.slice(0, 4); // Show top 4 insights
    }
    
    // Calculate temperature trend
    calculateTrend(temperatures) {
        if (temperatures.length < 2) return 0;
        const first = temperatures[0];
        const last = temperatures[temperatures.length - 1];
        return last - first;
    }
    
    // Calculate journey efficiency
    calculateJourneyEfficiency(hours) {
        // Assume optimal journey is 24 hours
        const optimalHours = 24;
        return Math.max(0, Math.min(1, 1 - (Math.abs(hours - optimalHours) / optimalHours)));
    }
    
    // Analytics page insights
    updateAnalyticsInsights() {
        const stats = this.calculateStatistics();
        const statsContainer = this.getCachedElement('analyticsStats');
        
        if (statsContainer && this.data.history.length > 0) {
            statsContainer.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon" style="background: linear-gradient(135deg, #3b82f6, #2563eb);">
                            <i class="fas fa-temperature-low"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-label">Avg Temperature</div>
                            <div class="stat-value">${stats.avgTemp.toFixed(1)}°C</div>
                            <div class="stat-change ${stats.tempTrend > 0 ? 'up' : 'down'}">
                                <i class="fas fa-arrow-${stats.tempTrend > 0 ? 'up' : 'down'}"></i>
                                ${Math.abs(stats.tempTrend).toFixed(1)}°C
                            </div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: linear-gradient(135deg, #06b6d4, #0891b2);">
                            <i class="fas fa-tint"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-label">Avg Humidity</div>
                            <div class="stat-value">${stats.avgHumidity.toFixed(1)}%</div>
                            <div class="stat-change info">
                                <i class="fas fa-chart-line"></i>
                                Normal range
                            </div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
                            <i class="fas fa-chart-bar"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-label">Data Points</div>
                            <div class="stat-value">${this.data.history.length}</div>
                            <div class="stat-change success">
                                <i class="fas fa-check"></i>
                                ${(this.data.history.length / (stats.timeSpan || 1)).toFixed(1)}/hour
                            </div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                            <i class="fas fa-percentage"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-label">Compliance Rate</div>
                            <div class="stat-value">${stats.complianceRate}%</div>
                            <div class="stat-change ${stats.complianceRate > 80 ? 'success' : 'warning'}">
                                <i class="fas fa-${stats.complianceRate > 80 ? 'check-circle' : 'exclamation-triangle'}"></i>
                                ${stats.complianceRate > 80 ? 'Excellent' : 'Needs improvement'}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="analytics-insights">
                    <h4><i class="fas fa-brain"></i> AI-Powered Recommendations</h4>
                    <ul>
                        ${this.generateAnalyticsRecommendations(stats).map(rec => `
                            <li><i class="${rec.icon}"></i> ${rec.text}</li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }
    }
    
    // Calculate comprehensive statistics
    calculateStatistics() {
        const history = this.data.history;
        if (history.length === 0) {
            return {
                avgTemp: 0,
                avgHumidity: 0,
                tempTrend: 0,
                complianceRate: 0,
                timeSpan: 0
            };
        }
        
        const temps = history.map(h => h.temperature);
        const humidities = history.map(h => h.humidity);
        
        const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
        const avgHumidity = humidities.reduce((a, b) => a + b, 0) / humidities.length;
        
        // Calculate temperature trend
        const midPoint = Math.floor(history.length / 2);
        const firstHalf = temps.slice(0, midPoint).reduce((a, b) => a + b, 0) / midPoint;
        const secondHalf = temps.slice(midPoint).reduce((a, b) => a + b, 0) / (temps.length - midPoint);
        const tempTrend = secondHalf - firstHalf;
        
        // Calculate compliance rate
        const inRangeCount = temps.filter(t => t >= 2 && t <= 8).length;
        const complianceRate = Math.round((inRangeCount / temps.length) * 100);
        
        // Calculate time span
        if (history.length > 1) {
            const firstTime = new Date(history[0].timestamp);
            const lastTime = new Date(history[history.length - 1].timestamp);
            const timeSpan = (lastTime - firstTime) / (1000 * 60 * 60); // hours
            
            return { avgTemp, avgHumidity, tempTrend, complianceRate, timeSpan };
        }
        
        return { avgTemp, avgHumidity, tempTrend, complianceRate, timeSpan: 0 };
    }
    
    // Generate AI-like recommendations
    generateAnalyticsRecommendations(stats) {
        const recommendations = [];
        
        if (stats.complianceRate < 80) {
            recommendations.push({
                icon: 'fas fa-exclamation-circle text-warning',
                text: `Temperature compliance is ${stats.complianceRate}%. Consider improving cooling system efficiency.`
            });
        } else {
            recommendations.push({
                icon: 'fas fa-check-circle text-success',
                text: `Excellent temperature control at ${stats.complianceRate}% compliance. Maintain current procedures.`
            });
        }
        
        if (stats.tempTrend > 1) {
            recommendations.push({
                icon: 'fas fa-fire text-danger',
                text: 'Warming trend detected. Check refrigeration unit performance and door seals.'
            });
        } else if (stats.tempTrend < -1) {
            recommendations.push({
                icon: 'fas fa-snowflake text-info',
                text: 'Cooling trend observed. Monitor for potential over-cooling or freezing risk.'
            });
        }
        
        if (stats.avgHumidity > 75) {
            recommendations.push({
                icon: 'fas fa-water text-primary',
                text: 'High humidity levels detected. Ensure adequate ventilation to prevent condensation.'
            });
        }
        
        if (this.data.history.length > 100) {
            recommendations.push({
                icon: 'fas fa-database text-success',
                text: `${this.data.history.length} data points collected. Consider archiving old data for better performance.`
            });
        }
        
        return recommendations;
    }
    
    // Tracking page insights
    updateTrackingInsights() {
        const data = this.data.latest;
        if (!data.lat || !data.lng) return;
        
        // Update map location
        if (this.map && this.marker) {
            this.marker.setLatLng([data.lat, data.lng]);
            this.map.setView([data.lat, data.lng], 13);
        }
        
        // Update location details
        this.updateElement('trackingLat', data.lat.toFixed(6));
        this.updateElement('trackingLng', data.lng.toFixed(6));
        
        // Calculate estimated distance traveled
        const distance = this.calculateDistance();
        this.updateElement('distanceTraveled', `${distance.toFixed(1)} km`);
        
        // Update journey timeline
        this.updateJourneyTimeline();
    }
    
    // Calculate distance traveled
    calculateDistance() {
        if (this.data.history.length < 2) return 0;
        
        let totalDistance = 0;
        for (let i = 1; i < this.data.history.length; i++) {
            const prev = this.data.history[i - 1];
            const curr = this.data.history[i];
            
            if (prev.lat && curr.lat) {
                totalDistance += this.haversineDistance(
                    prev.lat, prev.lng,
                    curr.lat, curr.lng
                );
            }
        }
        return totalDistance;
    }
    
    // Haversine formula for distance calculation
    haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    
    toRad(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    // Update journey timeline
    updateJourneyTimeline() {
        const timeline = this.getCachedElement('journeyTimeline');
        if (!timeline || this.data.history.length === 0) return;
        
        const milestones = this.data.history.filter((_, index) => 
            index % Math.max(1, Math.floor(this.data.history.length / 5)) === 0
        );
        
        timeline.innerHTML = milestones.map((milestone, index) => `
            <div class="timeline-item ${index === milestones.length - 1 ? 'active' : ''}">
                <div class="timeline-marker">
                    <i class="fas fa-${index === 0 ? 'play' : index === milestones.length - 1 ? 'map-marker-alt' : 'circle'}"></i>
                </div>
                <div class="timeline-content">
                    <div class="timeline-time">${new Date(milestone.timestamp).toLocaleString()}</div>
                    <div class="timeline-temp">${milestone.temperature.toFixed(1)}°C</div>
                    <div class="timeline-location">${milestone.lat.toFixed(4)}, ${milestone.lng.toFixed(4)}</div>
                </div>
            </div>
        `).join('');
    }
    
    // Alerts insights
    updateAlertsInsights() {
        const summary = this.calculateAlertSummary();
        const summaryContainer = this.getCachedElement('alertSummary');
        
        if (summaryContainer) {
            summaryContainer.innerHTML = `
                <div class="alert-summary-grid">
                    <div class="summary-card critical">
                        <i class="fas fa-exclamation-triangle"></i>
                        <div>
                            <div class="summary-value">${summary.critical}</div>
                            <div class="summary-label">Critical Alerts</div>
                        </div>
                    </div>
                    <div class="summary-card warning">
                        <i class="fas fa-exclamation-circle"></i>
                        <div>
                            <div class="summary-value">${summary.warning}</div>
                            <div class="summary-label">Warnings</div>
                        </div>
                    </div>
                    <div class="summary-card resolved">
                        <i class="fas fa-check-circle"></i>
                        <div>
                            <div class="summary-value">${summary.resolved}</div>
                            <div class="summary-label">Resolved</div>
                        </div>
                    </div>
                    <div class="summary-card total">
                        <i class="fas fa-list"></i>
                        <div>
                            <div class="summary-value">${summary.total}</div>
                            <div class="summary-label">Total Alerts</div>
                        </div>
                    </div>
                </div>
                
                <div class="alert-insights-text">
                    <i class="fas fa-info-circle"></i>
                    ${this.generateAlertInsightText(summary)}
                </div>
            `;
        }
    }
    
    // Calculate alert summary
    calculateAlertSummary() {
        const alerts = this.data.alerts;
        return {
            critical: alerts.filter(a => a.type.includes('High')).length,
            warning: alerts.filter(a => a.type.includes('Low')).length,
            resolved: alerts.filter(a => a.end_time).length,
            total: alerts.length
        };
    }
    
    // Generate alert insight text
    generateAlertInsightText(summary) {
        if (summary.total === 0) {
            return '✅ No alerts detected. All systems operating normally. Excellent cold chain management!';
        }
        
        if (summary.critical > 0) {
            return `⚠️ ${summary.critical} critical alert(s) require immediate attention. Review temperature control systems.`;
        }
        
        if (summary.warning > 0) {
            return `⚡ ${summary.warning} warning(s) detected. Monitor conditions closely to prevent escalation.`;
        }
        
        return `📊 ${summary.resolved} of ${summary.total} alerts resolved. Good response time!`;
    }
    
    // Update system information
    updateSystemInfo() {
        const sysInfo = this.getCachedElement('systemInfo');
        if (sysInfo) {
            const info = {
                appVersion: '2.0.0',
                apiStatus: this.connectionStatus,
                dataPoints: this.data.history.length,
                uptime: this.getUptime(),
                lastSync: this.performanceMetrics.lastUpdate ? 
                    this.performanceMetrics.lastUpdate.toLocaleString() : 'Never'
            };
            
            sysInfo.innerHTML = `
                <div class="info-row">
                    <span><i class="fas fa-code-branch"></i> Version</span>
                    <strong>${info.appVersion}</strong>
                </div>
                <div class="info-row">
                    <span><i class="fas fa-signal"></i> API Status</span>
                    <strong class="${info.apiStatus === 'connected' ? 'text-success' : 'text-danger'}">
                        ${info.apiStatus.toUpperCase()}
                    </strong>
                </div>
                <div class="info-row">
                    <span><i class="fas fa-database"></i> Data Points</span>
                    <strong>${info.dataPoints}</strong>
                </div>
                <div class="info-row">
                    <span><i class="fas fa-clock"></i> Uptime</span>
                    <strong>${info.uptime}</strong>
                </div>
                <div class="info-row">
                    <span><i class="fas fa-sync"></i> Last Sync</span>
                    <strong>${info.lastSync}</strong>
                </div>
            `;
        }
    }

    // Cleanup
    destroy() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
        
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.coldChainApp = new ColdChainApp();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.coldChainApp) {
        window.coldChainApp.destroy();
    }
});

// Handle visibility change (pause polling when tab not visible)
document.addEventListener('visibilitychange', () => {
    if (window.coldChainApp) {
        if (document.hidden) {
            if (window.coldChainApp.pollingInterval) {
                clearInterval(window.coldChainApp.pollingInterval);
            }
        } else {
            window.coldChainApp.startDataPolling();
        }
    }
});