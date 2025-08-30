// Background service worker for Sidebar Browser extension

// Initialize extension on startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Sidebar Browser extension started');
});

// Track sidebar tabs
let sidebarTabs = new Map();

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (sidebarTabs.has(tabId) && changeInfo.status === 'complete') {
    // Notify sidebar about tab update
    chrome.runtime.sendMessage({
      action: 'updateTabInfo',
      tab: {
        title: tab.title,
        url: tab.url
      }
    });
  }
});

// Listen for tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
  if (sidebarTabs.has(tabId)) {
    sidebarTabs.delete(tabId);
  }
});

// Handle extension installation
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Set default settings
    await chrome.storage.sync.set({
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
    
    console.log('Sidebar Browser extension installed');
  }
  
  // Create context menu
  createContextMenu();
});

// Create context menu for "Open in Sidebar"
function createContextMenu() {
  chrome.contextMenus.create({
    id: 'openInSidebar',
    title: 'Open in Sidebar',
    contexts: ['link']
  });
  
  // Add context menu for selected text
  chrome.contextMenus.create({
    id: 'searchInSidebar',
    title: 'Search "%s" in Sidebar',
    contexts: ['selection']
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'openInSidebar') {
    openInSidebar(info.linkUrl, tab.id);
  } else if (info.menuItemId === 'searchInSidebar') {
    searchInSidebar(info.selectionText, tab.id);
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Open side panel
  chrome.sidePanel.open({ tabId: tab.id });
});

// Handle messages from content scripts and side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'openInSidebar':
      openInSidebar(request.url, sender.tab?.id);
      break;
    
    case 'searchInSidebar':
      searchInSidebar(request.query, sender.tab?.id);
      break;
    
    case 'getCurrentTab':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        sendResponse({ url: tabs[0]?.url });
      });
      return true; // Keep message channel open for async response
    
    case 'openTab':
      chrome.tabs.create({ url: request.url });
      break;
    
    case 'getSettings':
      chrome.storage.sync.get(null, (settings) => {
        sendResponse(settings);
      });
      return true;
    
    case 'updateSettings':
      chrome.storage.sync.set(request.settings, () => {
        sendResponse({ success: true });
      });
      return true;
    
    case 'registerSidebarTab':
      sidebarTabs.set(request.tabId, true);
      sendResponse({ success: true });
      break;
    
    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// Function to open URL in sidebar
async function openInSidebar(url, tabId) {
  try {
    // Validate URL
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      console.error('Invalid URL:', url);
      return;
    }
    
    // Open side panel
    await chrome.sidePanel.open({ tabId });
    
    // Send URL to side panel
    setTimeout(() => {
      chrome.runtime.sendMessage({
        action: 'loadUrl',
        url: url
      });
    }, 100); // Small delay to ensure side panel is ready
    
  } catch (error) {
    console.error('Error opening URL in sidebar:', error);
  }
}

// Function to search in sidebar
async function searchInSidebar(query, tabId) {
  try {
    if (!query || !query.trim()) {
      console.error('Empty search query');
      return;
    }
    
    // Get search engine settings
    const settings = await chrome.storage.sync.get({
      defaultSearchEngine: 'google',
      searchEngines: {
        google: 'https://www.google.com/search?q=',
        bing: 'https://www.bing.com/search?q=',
        duckduckgo: 'https://duckduckgo.com/?q='
      }
    });
    
    const searchEngine = settings.defaultSearchEngine;
    const searchUrl = settings.searchEngines[searchEngine];
    
    if (!searchUrl) {
      console.error('Search engine not configured');
      return;
    }
    
    // Build search URL
    const encodedQuery = encodeURIComponent(query.trim());
    const fullSearchUrl = searchUrl + encodedQuery;
    
    // Open side panel and load search results
    await chrome.sidePanel.open({ tabId });
    
    setTimeout(() => {
      chrome.runtime.sendMessage({
        action: 'loadUrl',
        url: fullSearchUrl
      });
    }, 100);
    
  } catch (error) {
    console.error('Error searching in sidebar:', error);
  }
}

// Handle side panel enable/disable
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  switch (command) {
    case 'toggle-sidebar':
      chrome.sidePanel.open({ tabId: tab.id });
      break;
    
    case 'search-sidebar':
      // Focus search in sidebar
      chrome.runtime.sendMessage({
        action: 'focusSearch'
      });
      break;
  }
});

// Debug logging
console.log('Background script loaded');