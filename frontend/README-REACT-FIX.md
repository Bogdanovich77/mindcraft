# React Hook Errors Fix Guide

## Problem Summary

You were experiencing React hook errors with the following symptoms:
- "Invalid hook call. Hooks can only be called inside of the body of a function component"
- "You are loading @emotion/react when it is already loaded"
- "Cannot read properties of null (reading 'useState')"
- Multiple React instance conflicts

## Root Cause

The issue was caused by **dependency version conflicts** leading to multiple React instances being loaded in your application. This happened because:

1. **Package.json conflicts**: The `resolutions` field (Yarn-specific) was not working with npm
2. **Multiple React instances**: Different packages were installing different React versions
3. **Emotion conflicts**: Multiple instances of @emotion/react were being loaded

## Solution Applied

### 1. Fixed Package.json Dependencies

**Before**: Used `resolutions` (Yarn-only feature)
```json
"resolutions": {
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "@types/react": "^18.3.17",
  "@types/react-dom": "^18.3.5",
  "@emotion/react": "^11.14.0",
  "@emotion/styled": "^11.14.1"
}
```

**After**: Changed to `overrides` (npm-compatible)
```json
"overrides": {
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "@types/react": "^18.3.17",
  "@types/react-dom": "^18.3.5",
  "@emotion/react": "^11.14.0",
  "@emotion/styled": "^11.14.1"
}
```

### 2. Enhanced Vite Configuration

Updated [`vite.config.ts`](vite.config.ts) to:
- Add React aliases to ensure single instance
- Bundle React-related packages together
- Force dependency optimization
- Remove external React references that caused conflicts

### 3. Created Diagnostic Tools

- **`check-react-instances.js`**: Diagnoses React instance conflicts
- **`fix-react-hooks.sh`**: Automated fix script
- **This guide**: Complete documentation

## Quick Fix Steps

### Step 1: Clean Dependencies
```bash
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
```

### Step 2: Reinstall Dependencies
```bash
npm install
```

### Step 3: Verify Installation
```bash
node check-react-instances.js
```

### Step 4: Start Development Server
```bash
npm run dev
```

### Alternative: Use Automated Script
```bash
chmod +x fix-react-hooks.sh
./fix-react-hooks.sh
```

## Verification

After applying the fix, you should see:

1. **No more hook errors**: The "Invalid hook call" errors should disappear
2. **Single React instance**: Only one version of React loaded
3. **Clean console**: No duplicate @emotion/react warnings
4. **Working components**: All React components should render properly

## If Issues Persist

### Check Component Code
Ensure your components follow React rules:
- Hooks only called at the top level
- No hooks in conditional statements
- Proper import statements

### Common Issues to Check:

```typescript
// ❌ WRONG - Hook in conditional
if (condition) {
  const [state, setState] = useState();
}

// ✅ CORRECT - Hook at top level
const [state, setState] = useState();
if (condition) {
  // Use state here
}
```

### Check Import Statements
```typescript
// ✅ CORRECT - Consistent imports
import React, { useState, useEffect } from 'react';

// ❌ WRONG - Mixed import styles
import React from 'react';
import { useState } from 'react';
```

## Technical Details

### What Changed

1. **Package Management**: Switched from Yarn `resolutions` to npm `overrides`
2. **Build Configuration**: Enhanced Vite config to prevent duplicate instances
3. **Dependency Bundling**: Grouped React-related packages together
4. **Alias Resolution**: Added explicit React aliases

### Why This Works

- **Overrides**: npm `overrides` ensure consistent dependency versions across the entire tree
- **Aliases**: Vite aliases force the use of specific React instances
- **Bundling**: Grouping prevents multiple versions from being loaded separately
- **Optimization**: Forced optimization ensures dependencies are properly resolved

## Prevention

To prevent this issue in the future:

1. **Use npm overrides** instead of resolutions
2. **Keep dependencies updated** regularly
3. **Check peer dependencies** when adding new packages
4. **Run diagnostic script** after major dependency changes
5. **Use exact versions** for critical dependencies like React

## Support Tools

### Diagnostic Script
```bash
node check-react-instances.js
```

This script will:
- Check for React-related dependencies
- Identify version conflicts
- Scan for duplicate instances
- Provide recommendations

### Automated Fix Script
```bash
./fix-react-hooks.sh
```

This script will:
- Clean all dependencies
- Reinstall with correct versions
- Verify React installation
- Test the build process

## Success Criteria

✅ **Fixed**: No more "Invalid hook call" errors  
✅ **Fixed**: No duplicate @emotion/react warnings  
✅ **Fixed**: Single React instance loaded  
✅ **Verified**: Application starts without errors  
✅ **Tested**: All components render properly  

---

**Note**: If you continue to experience issues after applying these fixes, please check the browser console for specific error messages and ensure all your custom components follow React's rules of hooks.