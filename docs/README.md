# Sidebar Browser - Chrome Extension

A lightweight mini-browser for Chrome's side panel with intelligent search integration and seamless web browsing experience.

## Features

### 🚀 Core Features
- **Side Panel Browsing**: Browse any website in Chrome's side panel
- **Floating Search Bar**: Intelligent search with hover-to-reveal interface
- **Multiple Search Engines**: Support for Google, Bing, DuckDuckGo, and custom engines
- **Context Menu Integration**: Right-click any link to open in sidebar
- **Keyboard Shortcuts**: Quick access with customizable shortcuts

### 🎯 Smart Features
- **Cross-Origin Handling**: Graceful handling of sites that block iframe embedding
- **Smart Search**: Search results open in new tabs for better compatibility
- **Navigation Controls**: Back, forward, refresh, and address bar
- **Settings Management**: Comprehensive settings interface
- **History Management**: Built-in browsing history with navigation
- **Error Recovery**: Smart error handling with fallback options

### ⚙️ Customization
- **Custom Search Engines**: Add your own search engines with keywords
- **Behavior Settings**: Configure auto-hide, link behavior, and more
- **Privacy Controls**: Clear history options and privacy settings
- **Keyboard Shortcuts**: Customizable shortcuts for power users

## Installation

### From Source
1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The extension icon should appear in your toolbar

### Permissions
The extension requires the following permissions:
- `sidePanel`: Access to Chrome's side panel API
- `contextMenus`: Create right-click context menus
- `storage`: Save settings and preferences
- `activeTab`: Access to current tab information
- Host permissions for search engines (Google, Bing, DuckDuckGo)

## Usage

### Basic Usage
1. **Open Sidebar**: Click the extension icon or use `Ctrl+Shift+S`
2. **Navigate**: Use the address bar or quick action buttons
3. **Search**: Hover over the content area to reveal the floating search bar
4. **Context Menu**: Right-click any link and select "Open in Sidebar"

### Keyboard Shortcuts
- `Ctrl+Shift+S`: Toggle sidebar browser
- `Ctrl+Shift+F`: Focus search in sidebar
- `Ctrl+L`: Focus address bar
- `Ctrl+R`: Refresh current page
- `Ctrl+F`: Show floating search bar
- `Escape`: Hide floating search bar

### Search Features
- **Direct Search**: Type in the address bar and press Enter
- **Floating Search**: Use the hover-activated search bar
- **Context Search**: Right-click selected text to search in sidebar
- **Custom Engines**: Add your own search engines in settings

## Technical Implementation

### Architecture
The extension follows a modular architecture with clear separation of concerns:

```
extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for background tasks
├── sidepanel/            # Side panel interface
│   ├── panel.html        # Main panel HTML
│   ├── panel.js          # Panel functionality
│   └── panel.css         # Panel styling
├── settings/             # Settings interface
│   ├── settings.html     # Settings page HTML
│   ├── settings.js       # Settings functionality
│   └── settings.css      # Settings styling
└── icons/               # Extension icons
```

### Key Technical Decisions

#### Cross-Origin Handling
- **Iframe Sandboxing**: Uses sandboxed iframes for security
- **Error Detection**: Detects and handles cross-origin restrictions
- **Fallback Options**: Provides "Open in New Tab" for blocked sites

#### Search Implementation
- **URL Navigation**: Uses search engine URLs for compatibility
- **Query Encoding**: Proper URL encoding for search queries
- **Engine Configuration**: Flexible search engine configuration

#### Performance Optimization
- **Lazy Loading**: Efficient resource loading
- **History Management**: Optimized history storage and navigation
- **Event Handling**: Efficient event listeners and cleanup

## Settings Configuration

### Search Engine Settings
- **Default Engine**: Choose your preferred search engine
- **Custom URLs**: Modify search engine URLs if needed
- **Custom Engines**: Add your own search engines with keywords

### Behavior Settings
- **Auto-hide Search**: Automatically hide floating search bar
- **Link Behavior**: Configure how links open by default
- **Search Delay**: Set delay before hiding search bar
- **History Management**: Clear history options

### Privacy & Security
- **History Clearing**: Options to clear browsing history
- **Data Storage**: Control what data is stored
- **Permissions**: Minimal required permissions for security

## Development

### Prerequisites
- Chrome browser (version 114+ for side panel API)
- Basic knowledge of HTML, CSS, JavaScript
- Chrome Extension development concepts

### Development Setup
1. Clone the repository
2. Make changes to the code
3. Reload the extension in `chrome://extensions/`
4. Test changes in the side panel

### Key Files to Modify
- `manifest.json`: Extension configuration and permissions
- `background.js`: Background service worker logic
- `sidepanel/panel.js`: Main panel functionality
- `settings/settings.js`: Settings management
- CSS files: Styling and UI customization

### Testing
- Test with various websites (same-origin and cross-origin)
- Verify search functionality with different engines
- Test keyboard shortcuts and context menus
- Check error handling for blocked sites

## Browser Compatibility

### Supported Browsers
- **Chrome**: 114+ (for side panel API)
- **Edge**: 114+ (Chromium-based)
- **Other Chromium browsers**: May work with side panel support

### API Requirements
- `chrome.sidePanel` API (Chrome 114+)
- `chrome.contextMenus` API
- `chrome.storage` API
- `chrome.commands` API

## Troubleshooting

### Common Issues

#### Side Panel Not Opening
- Ensure Chrome version is 114 or higher
- Check if side panel is enabled in Chrome settings
- Verify extension permissions are granted

#### Search Not Working
- Check search engine URLs in settings
- Verify internet connection
- Try different search engines

#### Sites Not Loading
- Some sites block iframe embedding (banks, social media)
- Use "Open in New Tab" option for blocked sites
- Check browser console for error messages

#### Settings Not Saving
- Ensure storage permission is granted
- Check Chrome sync settings
- Try refreshing the settings page

### Debug Mode
Enable debug logging by opening the browser console and looking for messages from the extension.

## Contributing

### How to Contribute
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style
- Follow existing code style and patterns
- Add comments for complex logic
- Test changes across different scenarios
- Update documentation as needed

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues, questions, or feature requests:
1. Check the troubleshooting section
2. Search existing issues
3. Create a new issue with detailed information

## Changelog

### Version 1.0.0
- Initial release
- Side panel browsing functionality
- Search engine integration
- Settings management
- Keyboard shortcuts
- Context menu integration

---

**Sidebar Browser** - Making web browsing more efficient, one panel at a time. 