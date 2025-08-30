# Installation Guide - Sidebar Browser

## Prerequisites

- **Chrome Browser**: Version 114 or higher (required for side panel API)
- **Developer Mode**: Must be enabled in Chrome extensions

## Step-by-Step Installation

### 1. Download the Extension

**Option A: Clone from Git**
```bash
git clone https://github.com/yourusername/sidebar-browser.git
cd sidebar-browser
```

**Option B: Download ZIP**
1. Click the "Code" button on GitHub
2. Select "Download ZIP"
3. Extract the ZIP file to a folder

### 2. Open Chrome Extensions Page

1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Or go to Chrome menu → More tools → Extensions

### 3. Enable Developer Mode

1. Look for the "Developer mode" toggle in the top-right corner
2. Click to enable it (toggle should be blue)
3. This will show additional options below

### 4. Load the Extension

1. Click the "Load unpacked" button
2. Navigate to the extension folder you downloaded/extracted
3. Select the folder and click "Select Folder"
4. The extension should now appear in your extensions list

### 5. Verify Installation

1. Look for "Sidebar Browser" in your extensions list
2. The extension icon should appear in your Chrome toolbar
3. Click the icon to test if the side panel opens

## First-Time Setup

### 1. Grant Permissions

When you first use the extension, Chrome may ask for permissions:
- Click "Allow" for any permission requests
- These permissions are needed for the extension to function

### 2. Configure Settings (Optional)

1. Click the extension icon to open the side panel
2. Click the settings icon (gear) in the panel header
3. Configure your preferred search engine and other settings
4. Click "Save Settings"

### 3. Test Basic Features

1. **Open Sidebar**: Click the extension icon or use `Ctrl+Shift+S`
2. **Navigate**: Try the quick action buttons (Google, GitHub, Stack Overflow)
3. **Search**: Hover over the content area to see the floating search bar
4. **Context Menu**: Right-click any link and select "Open in Sidebar"

## Troubleshooting

### Extension Not Loading

**Problem**: Extension doesn't appear after loading
**Solutions**:
- Check Chrome version (must be 114+)
- Ensure Developer mode is enabled
- Try refreshing the extensions page
- Check for error messages in the extensions list

### Side Panel Not Opening

**Problem**: Clicking the extension icon doesn't open the side panel
**Solutions**:
- Check if side panel is enabled in Chrome settings
- Try right-clicking the extension icon and selecting "Open side panel"
- Restart Chrome browser
- Check browser console for error messages

### Permission Errors

**Problem**: Extension shows permission errors
**Solutions**:
- Go to `chrome://extensions/`
- Find Sidebar Browser
- Click "Details"
- Ensure all required permissions are granted
- Try removing and re-adding the extension

### Search Not Working

**Problem**: Search functionality doesn't work
**Solutions**:
- Check internet connection
- Verify search engine URLs in settings
- Try different search engines
- Check if search engines are accessible

## Uninstalling

### Remove Extension

1. Go to `chrome://extensions/`
2. Find "Sidebar Browser"
3. Click "Remove"
4. Confirm removal

### Clear Data (Optional)

1. Go to `chrome://settings/clearBrowserData`
2. Select "Extensions" from the dropdown
3. Choose time range
4. Click "Clear data"

## Updating

### Manual Update

1. Download the latest version
2. Go to `chrome://extensions/`
3. Click the refresh icon on the Sidebar Browser extension
4. Or remove and re-add the extension

### Automatic Updates

The extension will automatically update when:
- You're using the Chrome Web Store version
- You have automatic updates enabled in Chrome

## Support

If you encounter issues:

1. **Check this guide** for common solutions
2. **Review the README.md** for detailed documentation
3. **Check browser console** for error messages
4. **Create an issue** on GitHub with detailed information

## System Requirements

- **Operating System**: Windows, macOS, Linux
- **Browser**: Chrome 114+ or Chromium-based browsers
- **Memory**: Minimal (extension is lightweight)
- **Storage**: < 1MB for extension files

## Security Notes

- The extension only requests necessary permissions
- No data is sent to external servers
- All settings are stored locally in Chrome
- The extension follows Chrome's security best practices

---

**Need Help?** Check the [README.md](README.md) for more detailed information or create an issue on GitHub. 