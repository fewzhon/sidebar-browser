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
            }
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