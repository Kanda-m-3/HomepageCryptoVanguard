# Discord OAuth2 Troubleshooting

## Current Issue
Connection refused error when accessing Discord OAuth URL, even with correct redirect URI configuration.

## Investigation Results

### Working Configuration
- Client ID: 1383003178584510524
- Redirect URI: https://8a9eeb30-a0eb-4aba-a553-f6fc07f95202-00-33wq7j97wdxsb.janeway.replit.dev/api/auth/discord/callback
- Scopes: identify, guilds, email
- URL Format: Correct

### Failed Methods Tested
1. Server redirect (302) - Connection refused
2. JavaScript window.location.href - Connection refused  
3. JavaScript window.location.assign - Connection refused
4. New tab (window.open) - Connection refused
5. Same window direct navigation - Connection refused

## Most Likely Causes (In Order of Probability)

1. **Client Secret Issue**: Using wrong secret or old secret that was regenerated
2. **Application Type Mismatch**: Application needs proper OAuth2 configuration 
3. **Redirect URI Exact Match**: Even though URI is added, it might not be exact match
4. **Bot Token vs Client Secret**: Using bot token instead of OAuth2 client secret
5. **Application Permissions**: Missing required OAuth2 permissions in Discord portal
6. **Rate Limiting**: Too many failed attempts triggered temporary ban

## SOLUTION STEPS (Try in this exact order)

### Step 1: Verify Client Secret
1. Go to https://discord.com/developers/applications
2. Select your application (ID: 1383003178584510524)
3. Go to **OAuth2** tab (NOT General Information)
4. Copy the **Client Secret** (should be ~30 characters)
5. Update the secret in Replit environment

### Step 2: Check Application Type
1. In Discord Developer Portal → General Information
2. Make sure "Application Type" is set to "Bot" or "App"
3. If it's something else, change it

### Step 3: Verify Redirect URI Exact Match
1. In OAuth2 tab → Redirects section
2. Make sure this exact URI is listed:
   `https://8a9eeb30-a0eb-4aba-a553-f6fc07f95202-00-33wq7j97wdxsb.janeway.replit.dev/api/auth/discord/callback`
3. Remove any extra URIs that might be causing conflicts

### Step 4: Check OAuth2 Scopes
1. In OAuth2 tab → Default Authorization Link
2. Make sure these scopes are selected:
   - identify
   - email  
   - guilds
3. Save changes

### Step 5: Check Bot/Application Settings (CRITICAL)
1. Go to **Bot** tab in Discord Developer Portal
2. Check if "Public Bot" is ENABLED (must be ON for OAuth2)
3. If disabled, enable it and save
4. Go to **General Information** tab
5. Verify application is set to "Bot" type

### Step 6: Test Minimal OAuth2 Flow
Since even Discord's generated URL fails, the issue is likely:
- Bot/Application is not set to "Public Bot"
- Application is in development/restricted mode
- Discord region/network restrictions

## NEW DIAGNOSIS
The fact that Discord's own generated URL fails indicates this is NOT a Replit/code issue but a Discord application configuration problem. Most likely causes:
1. **Public Bot disabled** - OAuth2 requires public bot to be enabled
2. **Application type incorrect** - Must be configured as a Bot application
3. **Discord application in restricted/development mode**