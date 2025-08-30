// Content Script for Sidebar Browser Extension
// This script injects a sidebar browser directly into web pages to bypass CSP restrictions

class SidebarBrowser {
    constructor() {
        this.isVisible = false;
        this.currentUrl = '';
        this.history = [];
        this.historyIndex = -1;
        this.sidebar = null;
        this.iframe = null;
        this.settings = {};
        
        this.init();
    }
    
    async init() {
        await this.loadSettings();
        this.createSidebar();
        this.setupEventListeners();
        this.setupMessageListener();
        
        // Check if sidebar should be visible on page load
        const result = await chrome.storage.local.get('sidebarVisible');
        if (result.sidebarVisible) {
            this.showSidebar();
        }
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
            },
            sidebarWidth: 400,
            sidebarPosition: 'right'
        });
        
        this.settings = result;
    }
    
    createSidebar() {
        // Create sidebar container
        this.sidebar = document.createElement('div');
        this.sidebar.id = 'sidebar-browser-extension';
        this.sidebar.className = 'sidebar-browser-container';
        
        // Create sidebar HTML structure
        this.sidebar.innerHTML = `
            <div class="sidebar-header">
                <div class="sidebar-controls">
                    <button id="sidebar-back" class="sidebar-btn" title="Back">←</button>
                    <button id="sidebar-forward" class="sidebar-btn" title="Forward">→</button>
                    <button id="sidebar-refresh" class="sidebar-btn" title="Refresh">↻</button>
                    <button id="sidebar-close" class="sidebar-btn" title="Close">×</button>
                </div>
                <div class="sidebar-address-bar">
                    <input type="text" id="sidebar-url-input" placeholder="Enter URL or search...">
                    <button id="sidebar-go" class="sidebar-btn">Go</button>
                </div>
            </div>
            <div class="sidebar-content">
                <div id="sidebar-loading" class="sidebar-loading" style="display: none;">
                    <div class="loading-spinner"></div>
                    <p>Loading...</p>
                </div>
                <div id="sidebar-error" class="sidebar-error" style="display: none;">
                    <h3>Unable to load page</h3>
                    <p>This page cannot be displayed in the sidebar due to security restrictions.</p>
                    <button id="sidebar-open-new-tab" class="sidebar-btn">Open in New Tab</button>
                </div>
                <iframe id="sidebar-iframe" class="sidebar-iframe" style="display: none;"></iframe>
            </div>
            <div class="sidebar-footer">
                <div class="sidebar-search">
                    <input type="text" id="sidebar-search-input" placeholder="Search...">
                    <button id="sidebar-search-btn" class="sidebar-btn">Search</button>
                </div>
            </div>
        `;
        
        // Add sidebar to page
        document.body.appendChild(this.sidebar);
        
        // Get references to elements
        this.iframe = document.getElementById('sidebar-iframe');
        this.urlInput = document.getElementById('sidebar-url-input');
        this.searchInput = document.getElementById('sidebar-search-input');
        this.loadingElement = document.getElementById('sidebar-loading');
        this.errorElement = document.getElementById('sidebar-error');
        
        // Apply initial styles
        this.applyStyles();
    }
    
    applyStyles() {
        // Create and inject CSS
        const style = document.createElement('style');
        style.textContent = `
            .sidebar-browser-container {
                position: fixed;
                top: 0;
                right: 0;
                width: ${this.settings.sidebarWidth}px;
                height: 100vh;
                background: #ffffff;
                border-left: 1px solid #ddd;
                box-shadow: -2px 0 10px rgba(0,0,0,0.1);
                z-index: 2147483647;
                display: none;
                flex-direction: column;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .sidebar-browser-container.visible {
                display: flex;
            }
            
            .sidebar-header {
                background: #f8f9fa;
                border-bottom: 1px solid #ddd;
                padding: 10px;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .sidebar-controls {
                display: flex;
                gap: 5px;
            }
            
            .sidebar-btn {
                background: #ffffff;
                border: 1px solid #ddd;
                border-radius: 4px;
                padding: 6px 12px;
                cursor: pointer;
                font-size: 14px;
                transition: background-color 0.2s;
            }
            
            .sidebar-btn:hover {
                background: #f0f0f0;
            }
            
            .sidebar-address-bar {
                display: flex;
                gap: 5px;
            }
            
            #sidebar-url-input {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
            }
            
            .sidebar-content {
                flex: 1;
                position: relative;
                overflow: hidden;
            }
            
            .sidebar-iframe {
                width: 100%;
                height: 100%;
                border: none;
                background: #ffffff;
            }
            
            .sidebar-loading {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100%;
                color: #666;
            }
            
            .loading-spinner {
                width: 30px;
                height: 30px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #3498db;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 10px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .sidebar-error {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100%;
                text-align: center;
                padding: 20px;
                color: #666;
            }
            
            .sidebar-error h3 {
                color: #dc3545;
                margin-bottom: 10px;
            }
            
            .sidebar-footer {
                background: #f8f9fa;
                border-top: 1px solid #ddd;
                padding: 10px;
            }
            
            .sidebar-search {
                display: flex;
                gap: 5px;
            }
            
            #sidebar-search-input {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
            }
            
            /* Dark mode support */
            @media (prefers-color-scheme: dark) {
                .sidebar-browser-container {
                    background: #1a1a1a;
                    border-left-color: #333;
                }
                
                .sidebar-header,
                .sidebar-footer {
                    background: #2d2d2d;
                    border-color: #333;
                }
                
                .sidebar-btn {
                    background: #3a3a3a;
                    border-color: #555;
                    color: #fff;
                }
                
                .sidebar-btn:hover {
                    background: #4a4a4a;
                }
                
                #sidebar-url-input,
                #sidebar-search-input {
                    background: #3a3a3a;
                    border-color: #555;
                    color: #fff;
                }
                
                .sidebar-iframe {
                    background: #1a1a1a;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    setupEventListeners() {
        // Navigation controls
        document.getElementById('sidebar-back').addEventListener('click', () => this.goBack());
        document.getElementById('sidebar-forward').addEventListener('click', () => this.goForward());
        document.getElementById('sidebar-refresh').addEventListener('click', () => this.refresh());
        document.getElementById('sidebar-close').addEventListener('click', () => this.hideSidebar());
        
        // URL input
        this.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleUrlInput();
            }
        });
        
        document.getElementById('sidebar-go').addEventListener('click', () => this.handleUrlInput());
        
        // Search functionality
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        
        document.getElementById('sidebar-search-btn').addEventListener('click', () => this.performSearch());
        
        // Error handling
        document.getElementById('sidebar-open-new-tab').addEventListener('click', () => this.openInNewTab());
        
        // Iframe events
        this.iframe.addEventListener('load', () => this.onFrameLoad());
        this.iframe.addEventListener('error', () => this.onFrameError());
    }
    
    setupMessageListener() {
        // Listen for messages from background script
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            switch (request.action) {
                case 'toggleSidebar':
                    this.toggleSidebar();
                    if (request.focusSearch) {
                        setTimeout(() => {
                            this.searchInput.focus();
                        }, 300);
                    }
                    break;
                case 'loadUrl':
                    this.loadUrl(request.url);
                    break;
                case 'search':
                    this.performSearch(request.query);
                    break;
            }
        });
    }
    
    toggleSidebar() {
        if (this.isVisible) {
            this.hideSidebar();
        } else {
            this.showSidebar();
        }
    }
    
    showSidebar() {
        this.isVisible = true;
        this.sidebar.classList.add('visible');
        chrome.storage.local.set({ sidebarVisible: true });
        
        // Load default page if no current URL
        if (!this.currentUrl) {
            this.loadUrl('https://www.google.com');
        }
    }
    
    hideSidebar() {
        this.isVisible = false;
        this.sidebar.classList.remove('visible');
        chrome.storage.local.set({ sidebarVisible: false });
    }
    
    async handleUrlInput() {
        const input = this.urlInput.value.trim();
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
        this.urlInput.value = url;
        
        // Add to history
        this.addToHistory(url);
        
        // Show loading
        this.showLoading();
        
        // Load in iframe
        this.iframe.src = url;
        this.iframe.style.display = 'block';
    }
    
    performSearch(query = null) {
        const searchQuery = query || this.searchInput.value.trim();
        if (!searchQuery) return;
        
        const searchUrl = this.settings.searchEngines[this.settings.defaultSearchEngine] + encodeURIComponent(searchQuery);
        this.loadUrl(searchUrl);
        this.searchInput.value = '';
    }
    
    showLoading() {
        this.loadingElement.style.display = 'flex';
        this.errorElement.style.display = 'none';
        this.iframe.style.display = 'none';
    }
    
    onFrameLoad() {
        this.loadingElement.style.display = 'none';
        this.errorElement.style.display = 'none';
        this.iframe.style.display = 'block';
    }
    
    onFrameError() {
        this.loadingElement.style.display = 'none';
        this.iframe.style.display = 'none';
        this.errorElement.style.display = 'flex';
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

// Initialize sidebar browser
const sidebarBrowser = new SidebarBrowser();

// Expose to window for debugging
window.sidebarBrowser = sidebarBrowser;
