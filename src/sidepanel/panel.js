// Native Sidebar Panel Script
// This version uses Chrome's native sidePanel API with iframe limitations

class NativeSidebarBrowser {
    constructor() {
        this.currentUrl = '';
        this.history = [];
        this.historyIndex = -1;
        this.settings = {};
        
        this.init();
    }
    
    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.setupMessageListener();
        
        // Load default page
        this.loadUrl('https://www.google.com');
    }
    
    async loadSettings() {
        const result = await chrome.storage.sync.get({
            defaultSearchEngine: 'google',
            searchEngines: {
                google: 'https://www.google.com/search?q=',
                bing: 'https://www.bing.com/search?q=',
                duckduckgo: 'https://duckduckgo.com/?q='
            },
            customSearchEngines: {},
            behavior: {
                autoHideSearch: true,
                openLinksInSidebar: false,
                searchDelay: 1,
                clearHistoryOnClose: false
            }
        });
        
        this.settings = result;
    }
    
    setupEventListeners() {
        // Navigation controls
        document.getElementById('sidebar-back').addEventListener('click', () => this.goBack());
        document.getElementById('sidebar-forward').addEventListener('click', () => this.goForward());
        document.getElementById('sidebar-refresh').addEventListener('click', () => this.refresh());
        document.getElementById('sidebar-close').addEventListener('click', () => this.closeSidebar());
        
        // URL input
        const urlInput = document.getElementById('sidebar-url-input');
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleUrlInput();
            }
        });
        
        document.getElementById('sidebar-go').addEventListener('click', () => this.handleUrlInput());
        
        // Search functionality
        const searchInput = document.getElementById('sidebar-search-input');
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        
        document.getElementById('sidebar-search-btn').addEventListener('click', () => this.performSearch());
        
        // Error handling
        document.getElementById('sidebar-open-new-tab').addEventListener('click', () => this.openInNewTab());
        
        // Iframe events
        const iframe = document.getElementById('sidebar-iframe');
        iframe.addEventListener('load', () => this.onFrameLoad());
        iframe.addEventListener('error', () => this.onFrameError());
    }
    
    setupMessageListener() {
        // Listen for messages from background script
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            switch (request.action) {
                case 'loadUrl':
                    this.loadUrl(request.url);
                    break;
                case 'search':
                    this.performSearch(request.query);
                    break;
            }
        });
    }
    
    async handleUrlInput() {
        const input = document.getElementById('sidebar-url-input').value.trim();
        if (!input) return;
        
        // Check if it's a URL or search query
        if (this.isValidUrl(input)) {
            this.loadUrl(input);
        } else {
            this.performSearch(input);
        }
    }
    
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    loadUrl(url) {
        // Ensure URL has protocol
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        
        this.currentUrl = url;
        document.getElementById('sidebar-url-input').value = url;
        
        // Add to history
        this.addToHistory(url);
        
        // Show loading
        this.showLoading();
        
        // Load in iframe
        const iframe = document.getElementById('sidebar-iframe');
        iframe.src = url;
        iframe.style.display = 'block';
    }
    
    performSearch(query = null) {
        const searchQuery = query || document.getElementById('sidebar-search-input').value.trim();
        if (!searchQuery) return;
        
        const searchUrl = this.settings.searchEngines[this.settings.defaultSearchEngine] + encodeURIComponent(searchQuery);
        this.loadUrl(searchUrl);
        document.getElementById('sidebar-search-input').value = '';
    }
    
    showLoading() {
        document.getElementById('sidebar-loading').style.display = 'flex';
        document.getElementById('sidebar-error').style.display = 'none';
        document.getElementById('sidebar-iframe').style.display = 'none';
    }
    
    onFrameLoad() {
        document.getElementById('sidebar-loading').style.display = 'none';
        document.getElementById('sidebar-error').style.display = 'none';
        document.getElementById('sidebar-iframe').style.display = 'block';
    }
    
    onFrameError() {
        document.getElementById('sidebar-loading').style.display = 'none';
        document.getElementById('sidebar-iframe').style.display = 'none';
        document.getElementById('sidebar-error').style.display = 'flex';
    }
    
    goBack() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.loadUrl(this.history[this.historyIndex]);
        }
    }
    
    goForward() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.loadUrl(this.history[this.historyIndex]);
        }
    }
    
    refresh() {
        if (this.currentUrl) {
            this.loadUrl(this.currentUrl);
        }
    }
    
    closeSidebar() {
        // Close the side panel
        chrome.sidePanel.close();
    }
    
    openInNewTab() {
        if (this.currentUrl) {
            chrome.runtime.sendMessage({
                action: 'openTab',
                url: this.currentUrl
            });
        }
    }
    
    addToHistory(url) {
        // Remove any URLs after current index
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        // Add new URL
        this.history.push(url);
        this.historyIndex = this.history.length - 1;
        
        // Limit history size
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }
    }
}

// Initialize the native sidebar browser
const nativeSidebarBrowser = new NativeSidebarBrowser();
