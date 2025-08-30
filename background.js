// Background service worker for Sidebar Browser extension

// Initialize extension on startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Sidebar Browser extension started');
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
  // Toggle sidebar in the current tab
  chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar' });
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'openInSidebar':
      openInSidebar(request.url, sender.tab?.id);
      break;
    
    case 'searchInSidebar':
      searchInSidebar(request.query, sender.tab?.id);
      break;
    
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
    
    // Send URL to content script
    chrome.tabs.sendMessage(tabId, {
      action: 'loadUrl',
      url: url
    });
    
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
    
    // Send search query to content script
    chrome.tabs.sendMessage(tabId, {
      action: 'search',
      query: query
    });
    
  } catch (error) {
    console.error('Error searching in sidebar:', error);
  }
}

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  switch (command) {
    case 'toggle-sidebar':
      chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar' });
      break;
    
    case 'search-sidebar':
      // Toggle sidebar and focus search
      chrome.tabs.sendMessage(tab.id, { 
        action: 'toggleSidebar',
        focusSearch: true
      });
      break;
  }
});

// Debug logging
console.log('Background script loaded');