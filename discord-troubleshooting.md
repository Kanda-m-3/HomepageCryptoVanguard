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