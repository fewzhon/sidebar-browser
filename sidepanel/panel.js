// Sidebar Browser Panel Script

class SidebarBrowser {
    constructor() {
        this.currentUrl = '';
        this.history = [];
        this.historyIndex = -1;
        this.settings = {};
        this.floatingSearchTimeout = null;
        this.isFloatingSearchVisible = false;
        
        this.init();
    }
    
    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.setupFloatingSearch();
        this.setupTabView();
        this.showWelcomeScreen();
        
        // Listen for messages from background script
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'loadUrl') {
                this.loadUrl(request.url);
            } else if (request.action === 'focusSearch') {
                this.showFloatingSearch();
                setTimeout(() => {
                    document.getElementById('searchInput').focus();
                }, 300);
            } else if (request.action === 'updateTabInfo') {
                this.updateTabInfo(request.tab);
            }
        });
    }
    
    async loadSettings() {
        const result = await chrome.storage.sync.get({
            defaultSearchEngine: 'google',
            searchEngines: {
                google: 'https://www.google.com/search?q=',
                bing: 'https://www.bing.com/search?q=',
                duckduckgo: 'https://duckduckgo.com/?q='
            },
            customSearchEngines: {}
        });
        
        this.settings = result;
    }
    
    setupEventListeners() {
        // Navigation controls
        document.getElementById('backBtn').addEventListener('click', () => this.goBack());
        document.getElementById('forwardBtn').addEventListener('click', () => this.goForward());
        document.getElementById('refreshBtn').addEventListener('click', () => this.refresh());
        
        // URL input
        const urlInput = document.getElementById('urlInput');
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleUrlInput();
            }
        });
        
        document.getElementById('goBtn').addEventListener('click', () => this.handleUrlInput());
        
        // Header actions
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
        document.getElementById('openInTabBtn').addEventListener('click', () => this.openInNewTab());
        
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        
        document.getElementById('searchBtn').addEventListener('click', () => this.performSearch());
        
        // Quick action buttons
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const url = e.target.dataset.url;
                this.loadUrl(url);
            });
        });
        
        // Error screen
        document.getElementById('openInTabFromError').addEventListener('click', () => this.openInNewTab());
        
        // Iframe load events
        const iframe = document.getElementById('contentFrame');
        iframe.addEventListener('load', () => this.onFrameLoad());
        iframe.addEventListener('error', () => this.onFrameError());
        
        // Tab view events
        document.getElementById('refreshTabBtn').addEventListener('click', () => this.refreshTab());
        document.getElementById('openInMainTabBtn').addEventListener('click', () => this.openInMainTab());
    }
    
    setupFloatingSearch() {
        const hoverArea = document.getElementById('hoverArea');
        const floatingSearch = document.getElementById('floatingSearch');
        
        // Show floating search on hover
        hoverArea.addEventListener('mouseenter', () => {
            if (!this.isFloatingSearchVisible) {
                this.showFloatingSearch();
            }
        });
        
        // Hide floating search when leaving the area
        floatingSearch.addEventListener('mouseleave', () => {
            this.hideFloatingSearch();
        });
        
        // Keep visible when hovering over the search bar
        floatingSearch.addEventListener('mouseenter', () => {
            clearTimeout(this.floatingSearchTimeout);
        });
    }
    
    showFloatingSearch() {
        const floatingSearch = document.getElementById('floatingSearch');
        floatingSearch.classList.remove('hidden');
        
        // Small delay for smooth animation
        setTimeout(() => {
            floatingSearch.classList.add('visible');
        }, 10);
        
        this.isFloatingSearchVisible = true;
    }
    
    hideFloatingSearch() {
        const floatingSearch = document.getElementById('floatingSearch');
        
        this.floatingSearchTimeout = setTimeout(() => {
            floatingSearch.classList.remove('visible');
            setTimeout(() => {
                floatingSearch.classList.add('hidden');
            }, 300);
            this.isFloatingSearchVisible = false;
        }, 1000);
    }
    
    handleUrlInput() {
        const input = document.getElementById('urlInput').value.trim();
        if (!input) return;
        
        if (this.isValidUrl(input)) {
            this.loadUrl(input);
        } else {
            // Treat as search query
            this.performSearch(input);
        }
    }
    
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch {
            // Check if it's a domain-like string
            if (string.includes('.') && !string.includes(' ')) {
                return true;
            }
            return false;
        }
    }
    
    setupTabView() {
        // Initialize tab view
        this.sidebarTabId = null;
        this.tabViewActive = false;
    }
    
    async loadUrl(url) {
        if (!url) return;
        
        // Normalize URL
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        
        this.showLoading();
        this.hideWelcomeScreen();
        this.hideError();
        
        try {
            const iframe = document.getElementById('contentFrame');
            
            // Try iframe first for compatible sites
            const iframeSuccess = await this.loadInIframe(iframe, url);
            if (iframeSuccess) {
                this.currentUrl = url;
                this.addToHistory(url);
                this.updateAddressBar(url);
                this.updateNavigationButtons();
                return;
            }
            
            // If iframe fails, use tab-based approach
            const tabSuccess = await this.loadInTab(url);
            if (tabSuccess) {
                this.currentUrl = url;
                this.addToHistory(url);
                this.updateAddressBar(url);
                this.updateNavigationButtons();
                return;
            }
            
            // If both fail, show error
            this.showEnhancedError(url);
            
        } catch (error) {
            console.error('Error loading URL:', error);
            this.showEnhancedError(url);
        }
    }
    
    async loadInTab(url) {
        return new Promise((resolve) => {
            // Create a background tab for the URL
            chrome.tabs.create({
                url: url,
                active: false,
                pinned: true
            }, (tab) => {
                this.sidebarTabId = tab.id;
                this.tabViewActive = true;
                
                // Register tab with background script
                chrome.runtime.sendMessage({
                    action: 'registerSidebarTab',
                    tabId: tab.id
                });
                
                // Show tab view
                this.hideLoading();
                this.showTabView();
                
                // Update tab info
                this.updateTabInfo({
                    title: 'Loading...',
                    url: url
                });
                
                resolve(true);
            });
        });
    }
    
    async loadInIframe(iframe, url) {
        return new Promise((resolve) => {
            const handleLoad = () => {
                this.hideLoading();
                this.showFrame();
                resolve(true);
            };
            
            const handleError = () => {
                resolve(false);
            };
            
            iframe.addEventListener('load', handleLoad, { once: true });
            iframe.addEventListener('error', handleError, { once: true });
            
            // Set timeout
            const timeout = setTimeout(() => {
                resolve(false);
            }, 5000);
            
            iframe.src = url;
            
            // Clear timeout on load
            iframe.addEventListener('load', () => clearTimeout(timeout), { once: true });
        });
    }
    
    async loadWithProxy(iframe, url) {
        // Try using a CORS proxy (for educational purposes)
        // Note: In production, you'd want to use your own proxy service
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        
        try {
            const response = await fetch(proxyUrl);
            if (response.ok) {
                const html = await response.text();
                
                // Create a blob URL for the content
                const blob = new Blob([html], { type: 'text/html' });
                const blobUrl = URL.createObjectURL(blob);
                
                iframe.src = blobUrl;
                return true;
            }
        } catch (error) {
            console.log('Proxy load failed:', error);
        }
        
        return false;
    }
    
    async loadWithCORS(iframe, url) {
        // Try to fetch the page content directly
        try {
            const response = await fetch(url, {
                mode: 'cors',
                credentials: 'omit'
            });
            
            if (response.ok) {
                const html = await response.text();
                const blob = new Blob([html], { type: 'text/html' });
                const blobUrl = URL.createObjectURL(blob);
                
                iframe.src = blobUrl;
                return true;
            }
        } catch (error) {
            console.log('CORS load failed:', error);
        }
        
        return false;
    }
    
    performSearch(query = null) {
        if (!query) {
            query = document.getElementById('searchInput').value.trim();
        }
        
        if (!query) return;
        
        const searchEngine = this.settings.defaultSearchEngine;
        const searchUrl = this.settings.searchEngines[searchEngine];
        
        if (!searchUrl) {
            console.error('Search engine not configured');
            return;
        }
        
        const fullSearchUrl = searchUrl + encodeURIComponent(query);
        
        // For search engines, we'll open in a new tab instead of trying to load in iframe
        // This provides a better user experience since search engines typically block iframe embedding
        chrome.runtime.sendMessage({
            action: 'openTab',
            url: fullSearchUrl
        });
        
        // Show a helpful message
        this.showSearchMessage(query, searchEngine);
        
        // Clear search input
        document.getElementById('searchInput').value = '';
        this.hideFloatingSearch();
    }
    
    showSearchMessage(query, searchEngine) {
        const searchEngineNames = {
            'google': 'Google',
            'bing': 'Bing',
            'duckduckgo': 'DuckDuckGo'
        };
        
        const engineName = searchEngineNames[searchEngine] || searchEngine;
        
        // Show a temporary message
        this.showTemporaryMessage(
            `Searching for "${query}" on ${engineName}...`,
            'Search results will open in a new tab for better compatibility.'
        );
    }
    
    showTemporaryMessage(title, subtitle) {
        // Create a temporary message overlay
        const messageDiv = document.createElement('div');
        messageDiv.className = 'temp-message';
        messageDiv.innerHTML = `
            <div class="temp-message-content">
                <h3>${title}</h3>
                <p>${subtitle}</p>
            </div>
        `;
        
        // Add styles
        messageDiv.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            text-align: center;
            max-width: 300px;
        `;
        
        document.body.appendChild(messageDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }
    
    addToHistory(url) {
        // Remove any forward history if we're not at the end
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        this.history.push(url);
        this.historyIndex = this.history.length - 1;
        
        // Limit history size
        if (this.history.length > 100) {
            this.history.shift();
            this.historyIndex--;
        }
    }
    
    goBack() {
        if (this.sidebarTabId && this.tabViewActive) {
            // Use tab's built-in back functionality
            chrome.tabs.goBack(this.sidebarTabId);
        } else if (this.historyIndex > 0) {
            // Fallback to history-based navigation
            this.historyIndex--;
            const url = this.history[this.historyIndex];
            this.loadUrl(url);
        }
    }
    
    goForward() {
        if (this.sidebarTabId && this.tabViewActive) {
            // Use tab's built-in forward functionality
            chrome.tabs.goForward(this.sidebarTabId);
        } else if (this.historyIndex < this.history.length - 1) {
            // Fallback to history-based navigation
            this.historyIndex++;
            const url = this.history[this.historyIndex];
            this.loadUrl(url);
        }
    }
    
    refresh() {
        if (this.sidebarTabId && this.tabViewActive) {
            // Use tab's built-in refresh functionality
            chrome.tabs.reload(this.sidebarTabId);
        } else if (this.currentUrl) {
            // Fallback to URL-based refresh
            this.loadUrl(this.currentUrl);
        }
    }
    
    updateNavigationButtons() {
        const backBtn = document.getElementById('backBtn');
        const forwardBtn = document.getElementById('forwardBtn');
        
        backBtn.disabled = this.historyIndex <= 0;
        forwardBtn.disabled = this.historyIndex >= this.history.length - 1;
    }
    
    updateAddressBar(url) {
        document.getElementById('urlInput').value = url;
    }
    
    onFrameLoad() {
        this.hideLoading();
        this.showFrame();
        
        // Try to detect if the page loaded successfully
        const iframe = document.getElementById('contentFrame');
        try {
            // This will throw an error for cross-origin frames
            const doc = iframe.contentDocument;
            if (doc && doc.title) {
                console.log('Page loaded:', doc.title);
            }
        } catch (error) {
            // Expected for cross-origin frames
            console.log('Cross-origin frame loaded');
        }
    }
    
    onFrameError() {
        this.hideLoading();
        this.showError('This page cannot be displayed in the sidebar');
    }
    
    showLoading() {
        document.getElementById('loadingIndicator').classList.remove('hidden');
        document.getElementById('contentFrame').classList.add('hidden');
    }
    
    hideLoading() {
        document.getElementById('loadingIndicator').classList.add('hidden');
    }
    
    showFrame() {
        document.getElementById('contentFrame').classList.remove('hidden');
        document.getElementById('tabView').classList.add('hidden');
    }
    
    hideFrame() {
        document.getElementById('contentFrame').classList.add('hidden');
    }
    
    showTabView() {
        document.getElementById('tabView').classList.remove('hidden');
        document.getElementById('contentFrame').classList.add('hidden');
    }
    
    hideTabView() {
        document.getElementById('tabView').classList.add('hidden');
    }
    
    showError(message) {
        document.getElementById('errorText').textContent = message;
        document.getElementById('errorMessage').classList.remove('hidden');
        this.hideFrame();
    }
    
    showEnhancedError(url) {
        const errorMessage = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        
        // Create a more helpful error message
        let message = 'This page cannot be displayed in the sidebar.';
        let details = '';
        
        // Check if it's a search engine
        if (url.includes('google.com/search') || url.includes('bing.com/search') || url.includes('duckduckgo.com/')) {
            message = 'Search engines cannot be displayed in the sidebar due to security restrictions.';
            details = 'Try using the "Open in New Tab" button to view search results.';
        } else if (url.includes('facebook.com') || url.includes('instagram.com') || url.includes('twitter.com')) {
            message = 'Social media sites cannot be displayed in the sidebar.';
            details = 'These sites block iframe embedding for security reasons.';
        } else if (url.includes('youtube.com') || url.includes('netflix.com') || url.includes('spotify.com')) {
            message = 'Media streaming sites cannot be displayed in the sidebar.';
            details = 'These sites have strict content protection policies.';
        } else {
            details = 'This site may have security policies that prevent iframe embedding.';
        }
        
        errorText.innerHTML = `
            <strong>${message}</strong><br>
            <small style="color: #666; margin-top: 8px; display: block;">${details}</small>
        `;
        
        errorMessage.classList.remove('hidden');
        this.hideFrame();
    }
    
    hideError() {
        document.getElementById('errorMessage').classList.add('hidden');
    }
    
    showWelcomeScreen() {
        document.getElementById('welcomeScreen').classList.remove('hidden');
    }
    
    hideWelcomeScreen() {
        document.getElementById('welcomeScreen').classList.add('hidden');
    }
    
    openSettings() {
        chrome.runtime.openOptionsPage();
    }
    
    openInNewTab() {
        if (this.currentUrl) {
            chrome.runtime.sendMessage({
                action: 'openTab',
                url: this.currentUrl
            });
        }
    }
    
    // Tab management methods
    updateTabInfo(tab) {
        if (tab.title) {
            document.getElementById('tabTitle').textContent = tab.title;
        }
        if (tab.url) {
            document.getElementById('tabUrl').textContent = tab.url;
        }
    }
    
    refreshTab() {
        if (this.sidebarTabId) {
            chrome.tabs.reload(this.sidebarTabId);
        }
    }
    
    openInMainTab() {
        if (this.currentUrl) {
            chrome.tabs.create({ url: this.currentUrl, active: true });
        }
    }
    
    // Handle frame navigation changes
    detectFrameNavigation() {
        const iframe = document.getElementById('contentFrame');
        
        // Set up a periodic check for URL changes
        setInterval(() => {
            try {
                const frameUrl = iframe.contentWindow.location.href;
                if (frameUrl !== this.currentUrl) {
                    this.currentUrl = frameUrl;
                    this.updateAddressBar(frameUrl);
                    this.addToHistory(frameUrl);
                    this.updateNavigationButtons();
                }
            } catch (error) {
                // Cross-origin restriction - can't access frame URL
                // This is expected behavior
            }
        }, 1000);
    }
    
    // Keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + L - Focus address bar
            if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
                e.preventDefault();
                document.getElementById('urlInput').focus();
                document.getElementById('urlInput').select();
            }
            
            // Ctrl/Cmd + R - Refresh
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.refresh();
            }
            
            // Ctrl/Cmd + F - Focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                this.showFloatingSearch();
                setTimeout(() => {
                    document.getElementById('searchInput').focus();
                }, 300);
            }
            
            // Escape - Hide floating search
            if (e.key === 'Escape') {
                this.hideFloatingSearch();
            }
        });
    }
    
    // Enhanced error handling for iframe loading
    enhancedFrameHandling() {
        const iframe = document.getElementById('contentFrame');
        
        // Add error detection for common issues
        iframe.addEventListener('load', () => {
            setTimeout(() => {
                try {
                    // Try to access the frame document
                    const doc = iframe.contentDocument;
                    if (doc) {
                        // Check if it's an error page
                        if (doc.title.includes('Error') || doc.body.textContent.includes('refused to connect')) {
                            this.showError('This page cannot be displayed in the sidebar');
                        }
                    }
                } catch (error) {
                    // Cross-origin frame - this is normal
                    console.log('Cross-origin frame loaded successfully');
                }
            }, 1000);
        });
    }
    
    // Initialize enhanced features
    initializeEnhancedFeatures() {
        this.detectFrameNavigation();
        this.setupKeyboardShortcuts();
        this.enhancedFrameHandling();
    }
}

// Initialize the sidebar browser when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const browser = new SidebarBrowser();
    browser.initializeEnhancedFeatures();
});

// Global error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});