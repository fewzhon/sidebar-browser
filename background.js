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
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'openInSidebar') {
    try {
      // Show sidebar with the link URL
      await chrome.tabs.sendMessage(tab.id, { 
        action: 'showSidebar',
        url: info.linkUrl 
      });
    } catch (error) {
      // Content script not loaded, inject it first
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content-script.js']
      });
      
      // Then show sidebar
      setTimeout(() => {
        chrome.tabs.sendMessage(tab.id, { 
          action: 'showSidebar',
          url: info.linkUrl 
        });
      }, 100);
    }
  } else if (info.menuItemId === 'searchInSidebar') {
    try {
      // Show sidebar with search query
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(info.selectionText)}`;
      await chrome.tabs.sendMessage(tab.id, { 
        action: 'showSidebar',
        url: searchUrl 
      });
    } catch (error) {
      // Content script not loaded, inject it first
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content-script.js']
      });
      
      // Then show sidebar
      setTimeout(() => {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(info.selectionText)}`;
        chrome.tabs.sendMessage(tab.id, { 
          action: 'showSidebar',
          url: searchUrl 
        });
      }, 100);
    }
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Check if sidebar is already visible
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getSidebarState' });
    
    if (response && response.isVisible) {
      // Hide sidebar if already visible
      chrome.tabs.sendMessage(tab.id, { action: 'hideSidebar' });
    } else {
      // Show sidebar
      chrome.tabs.sendMessage(tab.id, { action: 'showSidebar' });
    }
  } catch (error) {
    // Content script not loaded, inject it first
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content-script.js']
    });
    
    // Then show sidebar
    setTimeout(() => {
      chrome.tabs.sendMessage(tab.id, { action: 'showSidebar' });
    }, 100);
  }
});

// Handle messages from content scripts and side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'openInSidebar':
      // Forward to content script
      if (sender.tab) {
        chrome.tabs.sendMessage(sender.tab.id, {
          action: 'showSidebar',
          url: request.url
        });
      }
      break;
    
    case 'searchInSidebar':
      // Forward to content script
      if (sender.tab) {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(request.query)}`;
        chrome.tabs.sendMessage(sender.tab.id, {
          action: 'showSidebar',
          url: searchUrl
        });
      }
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
    
    case 'openSettings':
      chrome.runtime.openOptionsPage();
      break;
    
    case 'registerSidebarTab':
      sidebarTabs.set(request.tabId, true);
      sendResponse({ success: true });
      break;
    
    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// Content script injection handles sidebar functionality
// These functions are now replaced by content script communication

// Handle side panel enable/disable
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  switch (command) {
    case 'toggle-sidebar':
      // Toggle content script sidebar
      try {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'getSidebarState' });
        if (response && response.isVisible) {
          chrome.tabs.sendMessage(tab.id, { action: 'hideSidebar' });
        } else {
          chrome.tabs.sendMessage(tab.id, { action: 'showSidebar' });
        }
      } catch (error) {
        // Content script not loaded, inject it first
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content-script.js']
        });
        
        setTimeout(() => {
          chrome.tabs.sendMessage(tab.id, { action: 'showSidebar' });
        }, 100);
      }
      break;
    
    case 'search-sidebar':
      // Show sidebar with search focus
      try {
        chrome.tabs.sendMessage(tab.id, { action: 'showSidebar' });
      } catch (error) {
        // Content script not loaded, inject it first
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content-script.js']
        });
        
        setTimeout(() => {
          chrome.tabs.sendMessage(tab.id, { action: 'showSidebar' });
        }, 100);
      }
      break;
  }
});

// Debug logging
console.log('Background script loaded');