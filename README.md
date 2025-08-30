# Sidebar Browser Extension

A Chrome extension that provides a true split-screen browsing experience by injecting a sidebar browser directly into web pages, bypassing Content Security Policy (CSP) restrictions that prevent iframe embedding.

## 🚀 Features

- **True Split-Screen**: Sidebar appears on the right side of any webpage
- **Bypass CSP Restrictions**: Works with Google, GitHub, Stack Overflow, and other sites that block iframe embedding
- **Direct Integration**: No iframe limitations or cross-origin issues
- **Responsive Design**: Adapts to page content and supports dark mode
- **Persistent State**: Remembers sidebar visibility across page loads
- **Full Navigation**: Back, forward, refresh, address bar functionality
- **Search Integration**: Multiple search engines with context menu support
- **Keyboard Shortcuts**: Global shortcuts for quick access

## 📁 Project Structure

```
sidebar-browser/
├── src/                    # Source code
│   ├── background.js      # Service worker
│   ├── content-script.js  # Main sidebar implementation
│   ├── icons/             # Extension icons
│   └── settings/          # Settings page
├── docs/                  # Documentation
│   ├── README.md          # Detailed documentation
│   ├── INSTALL.md         # Installation guide
│   ├── QUICK-START.md     # Quick start guide
│   └── TESTING_REPORT.md  # Testing documentation
├── tools/                 # Development tools
│   ├── deploy.js          # Deployment script
│   ├── generate-icons.html # Icon generation tool
│   └── test-content-script.html # Testing page
├── manifest.json          # Extension manifest
├── package.json           # Project metadata
└── .gitignore            # Git ignore rules
```

## 🛠️ Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the project directory
5. The extension icon should appear in your toolbar

## ⌨️ Usage

- **Click the extension icon** or press `Ctrl+Shift+S` to toggle the sidebar
- **Right-click any link** and select "Open in Sidebar"
- **Select text and right-click** to search in the sidebar
- **Use keyboard shortcuts**:
  - `Ctrl+Shift+S`: Toggle sidebar
  - `Ctrl+Shift+F`: Toggle sidebar and focus search

## 🔧 Development

### Prerequisites
- Node.js (for deployment tools)
- Chrome browser

### Building
```bash
# Validate the extension
node tools/deploy.js

# Generate icons (if needed)
# Open tools/generate-icons.html in a browser
```

### Testing
1. Load the extension in Chrome
2. Open `tools/test-content-script.html` in a browser
3. Test all features using the provided test links

## 📚 Documentation

- **[Installation Guide](docs/INSTALL.md)** - Detailed installation instructions
- **[Quick Start](docs/QUICK-START.md)** - Get up and running quickly
- **[Testing Report](docs/TESTING_REPORT.md)** - Comprehensive testing documentation
- **[Full Documentation](docs/README.md)** - Complete feature documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- **GitHub Repository**: [https://github.com/fewzhon/sidebar-browser](https://github.com/fewzhon/sidebar-browser)
- **Issues**: [https://github.com/fewzhon/sidebar-browser/issues](https://github.com/fewzhon/sidebar-browser/issues)

---

**Note**: This extension uses a content script injection approach to bypass CSP restrictions, providing a true split-screen experience similar to Edge browser's split-screen feature.
