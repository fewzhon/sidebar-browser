#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
    extensionName: 'sidebar-browser',
    version: '1.0.0',
    sourceDir: '.',
    outputDir: 'dist',
    excludePatterns: [
        'node_modules',
        '.git',
        '.DS_Store',
        '*.log',
        'dist',
        'deploy.js',
        'generate-icons.html',
        'test-extension.html',
        'package-lock.json',
        'yarn.lock'
    ]
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
    log(`\n${step}. ${message}`, 'cyan');
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

// Check if required files exist
function validateFiles() {
    logStep(1, 'Validating required files...');
    
    const requiredFiles = [
        'manifest.json',
        'background.js',
        'content-script.js',
        'settings/settings.html',
        'settings/settings.js',
        'settings/settings.css'
    ];
    
    const missingFiles = [];
    
    for (const file of requiredFiles) {
        if (!fs.existsSync(file)) {
            missingFiles.push(file);
        }
    }
    
    if (missingFiles.length > 0) {
        logError(`Missing required files: ${missingFiles.join(', ')}`);
        return false;
    }
    
    logSuccess('All required files found');
    return true;
}

// Check if icons exist
function validateIcons() {
    logStep(2, 'Checking icon files...');
    
    const requiredIcons = [
        'icons/icon-16.png',
        'icons/icon-32.png',
        'icons/icon-48.png',
        'icons/icon-128.png'
    ];
    
    const missingIcons = [];
    
    for (const icon of requiredIcons) {
        if (!fs.existsSync(icon)) {
            missingIcons.push(icon);
        }
    }
    
    if (missingIcons.length > 0) {
        logWarning(`Missing icon files: ${missingIcons.join(', ')}`);
        logWarning('Please run generate-icons.html to create the required PNG icons');
        return false;
    }
    
    logSuccess('All icon files found');
    return true;
}

// Create output directory
function createOutputDir() {
    logStep(3, 'Creating output directory...');
    
    if (fs.existsSync(config.outputDir)) {
        fs.rmSync(config.outputDir, { recursive: true, force: true });
    }
    
    fs.mkdirSync(config.outputDir, { recursive: true });
    logSuccess(`Created ${config.outputDir} directory`);
}

// Copy files to output directory
function copyFiles() {
    logStep(4, 'Copying files to output directory...');
    
    function shouldExclude(filePath) {
        const relativePath = path.relative(config.sourceDir, filePath);
        return config.excludePatterns.some(pattern => {
            if (pattern.includes('*')) {
                const regex = new RegExp(pattern.replace('*', '.*'));
                return regex.test(relativePath);
            }
            return relativePath.includes(pattern);
        });
    }
    
    function copyDirectory(src, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        
        const items = fs.readdirSync(src);
        
        for (const item of items) {
            const srcPath = path.join(src, item);
            const destPath = path.join(dest, item);
            
            if (shouldExclude(srcPath)) {
                continue;
            }
            
            const stat = fs.statSync(srcPath);
            
            if (stat.isDirectory()) {
                copyDirectory(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }
    
    copyDirectory(config.sourceDir, config.outputDir);
    logSuccess('Files copied successfully');
}

// Create ZIP file
function createZip() {
    logStep(5, 'Creating ZIP file...');
    
    const zipFileName = `${config.extensionName}-v${config.version}.zip`;
    const zipPath = path.join(config.outputDir, zipFileName);
    
    try {
        // Use system zip command if available
        const zipCommand = process.platform === 'win32' ? 'powershell' : 'zip';
        const zipArgs = process.platform === 'win32' 
            ? ['-Command', `Compress-Archive -Path "${config.outputDir}\\*" -DestinationPath "${zipPath}" -Force`]
            : ['-r', zipPath, '.'];
        
        execSync(`${zipCommand} ${zipArgs.join(' ')}`, { 
            cwd: config.outputDir,
            stdio: 'pipe'
        });
        
        logSuccess(`Created ${zipFileName}`);
        return zipPath;
    } catch (error) {
        logWarning('System zip command not available, creating manual ZIP...');
        // Fallback: create a simple archive structure
        const archiveInfo = {
            name: zipFileName,
            files: []
        };
        
        function addToArchive(dir, basePath = '') {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const relativePath = path.join(basePath, item);
                
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    addToArchive(fullPath, relativePath);
                } else {
                    archiveInfo.files.push(relativePath);
                }
            }
        }
        
        addToArchive(config.outputDir);
        
        // Write archive info
        fs.writeFileSync(
            path.join(config.outputDir, 'archive-info.json'), 
            JSON.stringify(archiveInfo, null, 2)
        );
        
        logWarning('Manual archive info created. Please manually zip the files.');
        return null;
    }
}

// Validate manifest.json
function validateManifest() {
    logStep(6, 'Validating manifest.json...');
    
    try {
        const manifestPath = path.join(config.sourceDir, 'manifest.json');
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        
        // Check required fields
        const requiredFields = ['manifest_version', 'name', 'version', 'permissions'];
        const missingFields = requiredFields.filter(field => !manifest[field]);
        
        if (missingFields.length > 0) {
            logError(`Missing required manifest fields: ${missingFields.join(', ')}`);
            return false;
        }
        
        // Check permissions
        const requiredPermissions = ['contextMenus', 'storage'];
        const missingPermissions = requiredPermissions.filter(perm => !manifest.permissions.includes(perm));
        
        if (missingPermissions.length > 0) {
            logError(`Missing required permissions: ${missingPermissions.join(', ')}`);
            return false;
        }
        
        logSuccess('Manifest validation passed');
        return true;
    } catch (error) {
        logError(`Manifest validation failed: ${error.message}`);
        return false;
    }
}

// Main deployment function
function deploy() {
    log('🚀 Starting Sidebar Browser Extension Deployment', 'bright');
    log(`Version: ${config.version}`, 'blue');
    
    // Validate files
    if (!validateFiles()) {
        logError('Deployment failed: Missing required files');
        process.exit(1);
    }
    
    // Validate icons (warning only)
    validateIcons();
    
    // Create output directory
    createOutputDir();
    
    // Copy files
    copyFiles();
    
    // Validate manifest
    if (!validateManifest()) {
        logError('Deployment failed: Manifest validation failed');
        process.exit(1);
    }
    
    // Create ZIP
    const zipPath = createZip();
    
    // Final summary
    log('\n🎉 Deployment Summary:', 'bright');
    logSuccess('Extension packaged successfully');
    log(`📁 Output directory: ${config.outputDir}`, 'blue');
    
    if (zipPath) {
        log(`📦 ZIP file: ${zipPath}`, 'blue');
    }
    
    log('\n📋 Next Steps:', 'bright');
    log('1. Load the extension in Chrome:', 'blue');
    log('   - Go to chrome://extensions/', 'yellow');
    log('   - Enable Developer mode', 'yellow');
    log('   - Click "Load unpacked" and select the dist folder', 'yellow');
    
    log('\n2. Test the extension:', 'blue');
    log('   - Open test-extension.html in your browser', 'yellow');
    log('   - Follow the test instructions', 'yellow');
    
    log('\n3. Publish to Chrome Web Store (optional):', 'blue');
    log('   - Create a developer account', 'yellow');
    log('   - Upload the ZIP file', 'yellow');
    log('   - Complete the submission process', 'yellow');
    
    log('\n✨ Deployment completed successfully!', 'green');
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    log('Sidebar Browser Extension Deployment Tool', 'bright');
    log('\nUsage:', 'blue');
    log('  node deploy.js [options]', 'yellow');
    log('\nOptions:', 'blue');
    log('  --help, -h     Show this help message', 'yellow');
    log('  --validate     Only validate files without deploying', 'yellow');
    log('  --version      Show version information', 'yellow');
    log('\nExamples:', 'blue');
    log('  node deploy.js                    # Full deployment', 'yellow');
    log('  node deploy.js --validate         # Validate only', 'yellow');
} else if (args.includes('--version')) {
    log(`Sidebar Browser Extension v${config.version}`, 'bright');
} else if (args.includes('--validate')) {
    log('🔍 Validating Sidebar Browser Extension', 'bright');
    validateFiles();
    validateIcons();
    validateManifest();
    log('\n✅ Validation completed!', 'green');
} else {
    deploy();
} 