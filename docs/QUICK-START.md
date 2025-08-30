# Quick Start Guide - Sidebar Browser Extension

## 🚀 Ready to Test!

Your Chrome extension is now complete and ready for testing. Follow these steps to get started:

## Step 1: Generate Icons

1. **Open the icon generator**: Open `generate-icons.html` in your browser
2. **Generate icons**: Click "Generate Icons" button
3. **Download icons**: Right-click each canvas and save as:
   - `icon-16.png` (16x16)
   - `icon-32.png` (32x32) 
   - `icon-48.png` (48x48)
   - `icon-128.png` (128x128)
4. **Place icons**: Save all PNG files in the `icons/` folder

## Step 2: Load Extension in Chrome

1. **Open Chrome Extensions**: Go to `chrome://extensions/`
2. **Enable Developer Mode**: Toggle "Developer mode" in top-right
3. **Load Extension**: Click "Load unpacked" and select your extension folder
4. **Verify Installation**: The extension icon should appear in your toolbar

## Step 3: Test the Extension

1. **Open Test Page**: Open `test-extension.html` in your browser
2. **Follow Test Instructions**: Use the interactive test page to verify all features
3. **Test Key Features**:
   - Click extension icon to open sidebar
   - Right-click links to "Open in Sidebar"
   - Select text and right-click to "Search in Sidebar"
   - Try keyboard shortcuts (`Ctrl+Shift+S`, `Ctrl+Shift+F`)
   - Test floating search bar
   - Configure settings

## Step 4: Package for Distribution

```bash
# Validate the extension
npm run validate

# Package the extension
npm run package
```

This will create a `dist/` folder with your packaged extension.

## 🎯 Key Features to Test

### ✅ Core Functionality
- [ ] Side panel opens when clicking extension icon
- [ ] Context menu "Open in Sidebar" works
- [ ] Context menu "Search in Sidebar" works
- [ ] Keyboard shortcuts work
- [ ] Floating search bar appears on hover

### ✅ Navigation & Search
- [ ] Address bar accepts URLs and search queries
- [ ] Navigation controls work (back, forward, refresh)
- [ ] Search works with different engines
- [ ] History navigation works

### ✅ Settings & Configuration
- [ ] Settings page opens correctly
- [ ] Search engine configuration saves
- [ ] Custom search engines can be added
- [ ] Behavior settings work

### ✅ Error Handling
- [ ] Cross-origin sites show error message
- [ ] "Open in New Tab" option works for blocked sites
- [ ] Loading indicators work properly

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+S` | Toggle sidebar browser |
| `Ctrl+Shift+F` | Focus search in sidebar |
| `Ctrl+L` | Focus address bar |
| `Ctrl+R` | Refresh current page |
| `Ctrl+F` | Show floating search bar |
| `Escape` | Hide floating search bar |

## 🔧 Troubleshooting

### Extension Not Loading
- Check Chrome version (must be 114+)
- Ensure Developer mode is enabled
- Verify all files are in the correct locations
- Check browser console for errors

### Icons Not Showing
- Make sure PNG icons are in the `icons/` folder
- Verify icon filenames match manifest.json
- Try reloading the extension

### Search Not Working
- Check search engine URLs in settings
- Verify internet connection
- Try different search engines

### Side Panel Not Opening
- Check if side panel is enabled in Chrome
- Try right-clicking extension icon
- Restart Chrome browser

## 📦 Deployment Options

### For Personal Use
- Use the extension directly from the source folder
- No additional steps needed

### For Distribution
1. **Package the extension**: `npm run package`
2. **Share the ZIP file**: Send `dist/sidebar-browser-v1.0.0.zip`
3. **Instructions for users**: Share the installation guide

### For Chrome Web Store
1. **Create developer account**: [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. **Upload ZIP file**: Use the packaged extension
3. **Complete submission**: Follow the store guidelines

## 🎉 Success!

Once you've completed these steps, you'll have a fully functional Chrome extension that:

- ✅ Opens websites in a side panel
- ✅ Provides intelligent search functionality
- ✅ Handles cross-origin restrictions gracefully
- ✅ Offers customizable settings
- ✅ Supports keyboard shortcuts
- ✅ Works with context menus

## 📚 Additional Resources

- **README.md**: Complete documentation
- **INSTALL.md**: Detailed installation guide
- **test-extension.html**: Interactive testing page
- **Chrome Extension Documentation**: [Developer Guide](https://developer.chrome.com/docs/extensions/)

---

**Happy browsing with your new Sidebar Browser extension!** 🚀 