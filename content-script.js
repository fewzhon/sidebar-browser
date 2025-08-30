// Content Script for Sidebar Browser
// This script injects a sidebar browser into the main page

class SidebarBrowserInjector {
    constructor() {
        this.sidebar = null;
        this.iframe = null;
        this.isVisible = false;
        this.currentUrl = '';
        this.init();
    }
    
    init() {
        // Listen for messages from the extension
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            switch (request.action) {
                case 'showSidebar':
                    this.showSidebar(request.url);
                    sendResponse({ success: true });
                    break;
                    
                case 'hideSidebar':
                    this.hideSidebar();
                    sendResponse({ success: true });
                    break;
                    
                case 'navigateSidebar':
                    this.navigateSidebar(request.url);
                    sendResponse({ success: true });
                    break;
                    
                case 'getSidebarState':
                    sendResponse({
                        isVisible: this.isVisible,
                        currentUrl: this.currentUrl
                    });
                    break;
            }
        });
        
        // Create the sidebar container (hidden initially)
        this.createSidebar();
    }
    
    createSidebar() {
        // Create sidebar container
        this.sidebar = document.createElement('div');
        this.sidebar.id = 'chrome-sidebar-browser';
        this.sidebar.className = 'chrome-sidebar-browser';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'sidebar-header';
        header.innerHTML = `
            <div class="sidebar-controls">
                <button class="sidebar-btn back-btn" title="Go back">←</button>
                <button class="sidebar-btn forward-btn" title="Go forward">→</button>
                <button class="sidebar-btn refresh-btn" title="Refresh">🔄</button>
            </div>
            <div class="sidebar-address-bar">
                <input type="text" class="sidebar-url-input" placeholder="Enter URL or search...">
                <button class="sidebar-go-btn">Go</button>
            </div>
            <div class="sidebar-actions">
                <button class="sidebar-btn settings-btn" title="Settings">⚙️</button>
                <button class="sidebar-btn close-btn" title="Close sidebar">✕</button>
            </div>
        `;
        
        // Create iframe
        this.iframe = document.createElement('iframe');
        this.iframe.className = 'sidebar-iframe';
        this.iframe.src = 'about:blank';
        
        // Create loading indicator
        const loading = document.createElement('div');
        loading.className = 'sidebar-loading';
        loading.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Loading...</p>
        `;
        
        // Assemble sidebar
        this.sidebar.appendChild(header);
        this.sidebar.appendChild(loading);
        this.sidebar.appendChild(this.iframe);
        
        // Add to page
        document.body.appendChild(this.sidebar);
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Navigation buttons
        this.sidebar.querySelector('.back-btn').addEventListener('click', () => {
            if (this.iframe.contentWindow.history.length > 1) {
                this.iframe.contentWindow.history.back();
            }
        });
        
        this.sidebar.querySelector('.forward-btn').addEventListener('click', () => {
            this.iframe.contentWindow.history.forward();
        });
        
        this.sidebar.querySelector('.refresh-btn').addEventListener('click', () => {
            this.iframe.src = this.iframe.src;
        });
        
        // Address bar
        const urlInput = this.sidebar.querySelector('.sidebar-url-input');
        const goBtn = this.sidebar.querySelector('.sidebar-go-btn');
        
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.navigateToUrl(urlInput.value);
            }
        });
        
        goBtn.addEventListener('click', () => {
            this.navigateToUrl(urlInput.value);
        });
        
        // Close button
        this.sidebar.querySelector('.close-btn').addEventListener('click', () => {
            this.hideSidebar();
        });
        
        // Settings button
        this.sidebar.querySelector('.settings-btn').addEventListener('click', () => {
            chrome.runtime.sendMessage({ action: 'openSettings' });
        });
        
        // Iframe events
        this.iframe.addEventListener('load', () => {
            this.hideLoading();
            this.updateAddressBar();
        });
        
        this.iframe.addEventListener('loadstart', () => {
            this.showLoading();
        });
    }
    
    showSidebar(url = null) {
        if (this.isVisible) return;
        
        this.isVisible = true;
        this.sidebar.classList.add('visible');
        
        // Adjust main page layout
        this.adjustPageLayout();
        
        if (url) {
            this.navigateToUrl(url);
        }
    }
    
    hideSidebar() {
        if (!this.isVisible) return;
        
        this.isVisible = false;
        this.sidebar.classList.remove('visible');
        
        // Restore main page layout
        this.restorePageLayout();
    }
    
    navigateSidebar(url) {
        this.navigateToUrl(url);
    }
    
    navigateToUrl(url) {
        if (!url) return;
        
        // Normalize URL
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        
        this.currentUrl = url;
        this.iframe.src = url;
        this.showLoading();
    }
    
    updateAddressBar() {
        try {
            const url = this.iframe.contentWindow.location.href;
            this.sidebar.querySelector('.sidebar-url-input').value = url;
        } catch (error) {
            // Cross-origin restriction - can't access iframe URL
            this.sidebar.querySelector('.sidebar-url-input').value = this.currentUrl;
        }
    }
    
    showLoading() {
        this.sidebar.querySelector('.sidebar-loading').style.display = 'flex';
        this.iframe.style.display = 'none';
    }
    
    hideLoading() {
        this.sidebar.querySelector('.sidebar-loading').style.display = 'none';
        this.iframe.style.display = 'block';
    }
    
    adjustPageLayout() {
        // Add margin to main content to make room for sidebar
        const style = document.createElement('style');
        style.id = 'chrome-sidebar-layout';
        style.textContent = `
            body { margin-right: 400px !important; }
            .chrome-sidebar-browser { display: block !important; }
        `;
        document.head.appendChild(style);
    }
    
    restorePageLayout() {
        // Remove layout adjustments
        const style = document.getElementById('chrome-sidebar-layout');
        if (style) {
            style.remove();
        }
    }
}

// Initialize the sidebar browser
const sidebarBrowser = new SidebarBrowserInjector();

// Handle page navigation (to hide sidebar when user navigates)
let currentUrl = window.location.href;
const observer = new MutationObserver(() => {
    if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        sidebarBrowser.hideSidebar();
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    sidebarBrowser.hideSidebar();
});
