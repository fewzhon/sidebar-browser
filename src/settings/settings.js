// Sidebar Browser Settings Script

class SettingsManager {
    constructor() {
        this.settings = {};
        this.customEngines = {};
        this.init();
    }
    
    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.populateSettings();
        this.renderCustomEngines();
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
            keyboardShortcuts: {
                toggleSidebar: 'Ctrl+Shift+S',
                searchInSidebar: 'Ctrl+Shift+F'
            },
            useNativeSidePanel: false
        });
        
        this.settings = result;
        this.customEngines = result.customSearchEngines || {};
    }
    
    setupEventListeners() {
        // Save settings button
        document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());
        
        // Reset settings button
        document.getElementById('resetSettings').addEventListener('click', () => this.resetSettings());
        
        // Clear history button
        document.getElementById('clearHistory').addEventListener('click', () => this.clearHistory());
        
        // Add custom search engine
        document.getElementById('addCustomEngine').addEventListener('click', () => this.showCustomEngineModal());
        
        // Modal controls
        document.getElementById('closeModal').addEventListener('click', () => this.hideCustomEngineModal());
        document.getElementById('cancelCustomEngine').addEventListener('click', () => this.hideCustomEngineModal());
        document.getElementById('saveCustomEngine').addEventListener('click', () => this.saveCustomEngine());
        
        // Close modal on backdrop click
        document.getElementById('customEngineModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideCustomEngineModal();
            }
        });
        
        // Auto-save on input change
        document.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('change', () => this.validateAndPreview());
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideCustomEngineModal();
            }
            
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveSettings();
            }
        });
    }
    
    populateSettings() {
        // Default search engine
        document.getElementById('defaultSearchEngine').value = this.settings.defaultSearchEngine;
        
        // Search engine URLs
        document.getElementById('googleUrl').value = this.settings.searchEngines.google;
        document.getElementById('bingUrl').value = this.settings.searchEngines.bing;
        document.getElementById('duckduckgoUrl').value = this.settings.searchEngines.duckduckgo;
        
        // Sidebar mode
        if (this.settings.useNativeSidePanel) {
            document.getElementById('nativeSidePanelMode').checked = true;
        } else {
            document.getElementById('contentScriptMode').checked = true;
        }
        
        // Behavior settings
        const behavior = this.settings.behavior || {};
        document.getElementById('autoHideSearch').checked = behavior.autoHideSearch !== false;
        document.getElementById('openLinksInSidebar').checked = behavior.openLinksInSidebar === true;
        document.getElementById('searchDelay').value = behavior.searchDelay || 1;
        document.getElementById('clearHistoryOnClose').checked = behavior.clearHistoryOnClose === true;
    }
    
    renderCustomEngines() {
        const container = document.getElementById('customEngines');
        container.innerHTML = '';
        
        Object.entries(this.customEngines).forEach(([key, engine]) => {
            const engineElement = this.createCustomEngineElement(key, engine);
            container.appendChild(engineElement);
        });
        
        if (Object.keys(this.customEngines).length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = 'No custom search engines added yet.';
            emptyMessage.style.color = '#666';
            emptyMessage.style.fontStyle = 'italic';
            container.appendChild(emptyMessage);
        }
    }
    
    createCustomEngineElement(key, engine) {
        const div = document.createElement('div');
        div.className = 'custom-engine-item';
        
        div.innerHTML = `
            <div class="custom-engine-info">
                <div class="custom-engine-name">${engine.name}</div>
                <div class="custom-engine-url">${engine.url}</div>
                ${engine.keyword ? `<div class="custom-engine-keyword">Keyword: ${engine.keyword}</div>` : ''}
            </div>
            <div class="custom-engine-actions">
                <button class="button button-small button-outline" onclick="settingsManager.editCustomEngine('${key}')">
                    Edit
                </button>
                <button class="button button-small button-danger" onclick="settingsManager.deleteCustomEngine('${key}')">
                    Delete
                </button>
            </div>
        `;
        
        return div;
    }
    
    showCustomEngineModal() {
        document.getElementById('customEngineModal').classList.remove('hidden');
        document.getElementById('customEngineName').focus();
    }
    
    hideCustomEngineModal() {
        document.getElementById('customEngineModal').classList.add('hidden');
        // Clear form
        document.getElementById('customEngineName').value = '';
        document.getElementById('customEngineUrl').value = '';
        document.getElementById('customEngineKeyword').value = '';
    }
    
    async saveCustomEngine() {
        const name = document.getElementById('customEngineName').value.trim();
        const url = document.getElementById('customEngineUrl').value.trim();
        const keyword = document.getElementById('customEngineKeyword').value.trim();
        
        if (!name || !url) {
            this.showStatusMessage('Name and URL are required.', 'error');
            return;
        }
        
        if (!url.includes('%s')) {
            this.showStatusMessage('URL must contain %s placeholder for search query.', 'error');
            return;
        }
        
        const key = name.toLowerCase().replace(/\s+/g, '_');
        this.customEngines[key] = { name, url, keyword };
        
        this.hideCustomEngineModal();
        this.renderCustomEngines();
        this.showStatusMessage('Custom search engine added!', 'success');
    }
    
    editCustomEngine(key) {
        const engine = this.customEngines[key];
        if (!engine) return;
        
        document.getElementById('customEngineName').value = engine.name;
        document.getElementById('customEngineUrl').value = engine.url;
        document.getElementById('customEngineKeyword').value = engine.keyword || '';
        
        this.showCustomEngineModal();
        
        // Update save button to edit mode
        const saveBtn = document.getElementById('saveCustomEngine');
        saveBtn.textContent = 'Update Engine';
        saveBtn.onclick = () => this.updateCustomEngine(key);
    }
    
    async updateCustomEngine(key) {
        const name = document.getElementById('customEngineName').value.trim();
        const url = document.getElementById('customEngineUrl').value.trim();
        const keyword = document.getElementById('customEngineKeyword').value.trim();
        
        if (!name || !url) {
            this.showStatusMessage('Name and URL are required.', 'error');
            return;
        }
        
        if (!url.includes('%s')) {
            this.showStatusMessage('URL must contain %s placeholder for search query.', 'error');
            return;
        }
        
        delete this.customEngines[key];
        const newKey = name.toLowerCase().replace(/\s+/g, '_');
        this.customEngines[newKey] = { name, url, keyword };
        
        this.hideCustomEngineModal();
        this.renderCustomEngines();
        this.showStatusMessage('Custom search engine updated!', 'success');
        
        // Reset save button
        const saveBtn = document.getElementById('saveCustomEngine');
        saveBtn.textContent = 'Add Engine';
        saveBtn.onclick = () => this.saveCustomEngine();
    }
    
    deleteCustomEngine(key) {
        if (confirm('Are you sure you want to delete this custom search engine?')) {
            delete this.customEngines[key];
            this.renderCustomEngines();
            this.showStatusMessage('Custom search engine deleted!', 'success');
        }
    }
    
    async saveSettings() {
        try {
            // Collect all settings
            const settings = {
                defaultSearchEngine: document.getElementById('defaultSearchEngine').value,
                searchEngines: {
                    google: document.getElementById('googleUrl').value,
                    bing: document.getElementById('bingUrl').value,
                    duckduckgo: document.getElementById('duckduckgoUrl').value
                },
                customSearchEngines: this.customEngines,
                behavior: {
                    autoHideSearch: document.getElementById('autoHideSearch').checked,
                    openLinksInSidebar: document.getElementById('openLinksInSidebar').checked,
                    searchDelay: parseFloat(document.getElementById('searchDelay').value),
                    clearHistoryOnClose: document.getElementById('clearHistoryOnClose').checked
                },
                keyboardShortcuts: this.settings.keyboardShortcuts,
                useNativeSidePanel: document.getElementById('nativeSidePanelMode').checked
            };
            
            // Save to storage
            await chrome.storage.sync.set(settings);
            
            // Update local settings
            this.settings = { ...this.settings, ...settings };
            
            // Notify background script about mode change
            chrome.runtime.sendMessage({
                action: 'setSidebarMode',
                useNativeSidePanel: settings.useNativeSidePanel
            });
            
            this.showStatusMessage('Settings saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showStatusMessage('Error saving settings. Please try again.', 'error');
        }
    }
    
    async resetSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            await chrome.storage.sync.clear();
            await this.loadSettings();
            this.populateSettings();
            this.renderCustomEngines();
            this.showStatusMessage('Settings reset to defaults!', 'success');
        }
    }
    
    async clearHistory() {
        if (confirm('Are you sure you want to clear all browsing history?')) {
            await chrome.storage.local.clear();
            this.showStatusMessage('Browsing history cleared!', 'success');
        }
    }
    
    validateAndPreview() {
        // Basic validation for search engine URLs
        const googleUrl = document.getElementById('googleUrl').value;
        const bingUrl = document.getElementById('bingUrl').value;
        const duckduckgoUrl = document.getElementById('duckduckgoUrl').value;
        
        const urls = [googleUrl, bingUrl, duckduckgoUrl];
        const hasInvalidUrl = urls.some(url => url && !url.includes('%s'));
        
        if (hasInvalidUrl) {
            this.showStatusMessage('Search engine URLs must contain %s placeholder.', 'error');
            return false;
        }
        
        return true;
    }
    
    showStatusMessage(message, type = 'success') {
        const statusElement = document.getElementById('statusMessage');
        statusElement.textContent = message;
        statusElement.className = `status-message ${type}`;
        
        setTimeout(() => {
            statusElement.classList.add('hidden');
        }, 3000);
    }
}

// Initialize settings manager
const settingsManager = new SettingsManager();