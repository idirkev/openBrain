# Google Cloud Project Setup for Open Brain

**Document Version:** 1.0  
**Date:** March 17, 2026  
**Project:** Open Brain Integration  
**Purpose:** Configure Google Cloud Project for Gmail, Calendar, Drive, and Tasks API access

---

## ⚠️ SECURITY WARNING

**NEVER commit `client_secrets.json` or any OAuth credentials to git!**

The client secret and refresh token are sensitive credentials. They will be stored in:
- Supabase Secrets (production)
- Local environment variables (development)
- **NOT** in this repository

---

## Quick Reference

| Resource | Value / Location |
|----------|------------------|
| **Project Name** | Open Brain Integration |
| **Console URL** | https://console.cloud.google.com/ |
| **Supabase Project** | jeuxslbhjubxmhtzpvqf |
| **Redirect URI** | `https://jeuxslbhjubxmhtzpvqf.supabase.co/functions/v1/google-auth/callback` |

---

## Step-by-Step Setup Instructions

### Step 1: Create or Select Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account (kev@idirnet.com)
3. At the top of the page, click the project selector dropdown
4. Choose one of:
   - **Create New Project:**
     - Click "New Project"
     - Project name: `Open Brain Integration`
     - Organization: Select idirnet if available
     - Location: Default
     - Click "Create"
   - **Select Existing:** Choose an existing project
5. **Note the Project ID** (e.g., `open-brain-integration-123456`)

**Project ID (fill in after creation):** `___________________________`

---

### Step 2: Enable Required APIs

Navigate to **APIs & Services** > **Library** and enable each API:

#### 2.1 Gmail API
1. Search: "Gmail API"
2. Click on "Gmail API"
3. Click **ENABLE**
4. Wait for activation (may take 1-2 minutes)

#### 2.2 Google Calendar API
1. Search: "Google Calendar API"
2. Click on "Google Calendar API"
3. Click **ENABLE**

#### 2.3 Google Drive API
1. Search: "Google Drive API"
2. Click on "Google Drive API"
3. Click **ENABLE**

#### 2.4 Google Tasks API
1. Search: "Tasks API"
2. Click on "Tasks API"
3. Click **ENABLE**

#### Verification
Go to **APIs & Services** > **Dashboard** - you should see all 4 APIs listed as enabled.

**Status (check after enabling):**
- [ ] Gmail API enabled
- [ ] Google Calendar API enabled
- [ ] Google Drive API enabled
- [ ] Google Tasks API enabled

---

### Step 3: Configure OAuth Consent Screen

Navigate to **APIs & Services** > **OAuth consent screen**

#### 3.1 Select User Type

**Choose based on your setup:**

| If idirnet has Google Workspace | Select |
|--------------------------------|--------|
| Yes (business/enterprise account) | **Internal** |
| No (personal Gmail) | **External** |

Click **CREATE**

#### 3.2 App Information

Fill in the following:

| Field | Value |
|-------|-------|
| **App name** | Open Brain |
| **User support email** | kev@idirnet.com |
| **App logo** | (Optional - can upload Open Brain logo) |
| **App domain** | (Leave blank for now) |
| **Authorized domains** | idirnet.com |
| **Developer contact information** | kev@idirnet.com |

Click **SAVE AND CONTINUE**

#### 3.3 Scopes

Click **ADD OR REMOVE SCOPES**

Add these scopes manually (paste in the "Manually add scopes" field):

```
https://www.googleapis.com/auth/gmail.readonly
https://www.googleapis.com/auth/gmail.modify
https://www.googleapis.com/auth/calendar.readonly
https://www.googleapis.com/auth/calendar.events
https://www.googleapis.com/auth/drive.readonly
https://www.googleapis.com/auth/drive.metadata.readonly
https://www.googleapis.com/auth/tasks
https://www.googleapis.com/auth/tasks.readonly
```

Click **ADD TO TABLE** for each scope, then **UPDATE**

Click **SAVE AND CONTINUE**

#### 3.4 Test Users (External User Type Only)

If you selected **External**:
1. Click **ADD USERS**
2. Add: `kev@idirnet.com`
3. Click **SAVE AND CONTINUE**

#### 3.5 Summary

Review and click **BACK TO DASHBOARD**

If using **External** user type, you'll need to publish the app later (see "Publishing the App" section below).

---

### Step 4: Create OAuth 2.0 Credentials

Navigate to **APIs & Services** > **Credentials**

#### 4.1 Create OAuth Client ID

1. Click **+ CREATE CREDENTIALS**
2. Select **OAuth client ID**

#### 4.2 Configure Client

| Field | Value |
|-------|-------|
| **Application type** | Web application |
| **Name** | Open Brain Edge Functions |

#### 4.3 Authorized Redirect URIs

Under "Authorized redirect URIs", click **ADD URI**:

```
https://jeuxslbhjubxmhtzpvqf.supabase.co/functions/v1/google-auth/callback
```

> **Note:** This is the callback URL for the Supabase Edge Function. The Edge Function will handle the OAuth callback and exchange the authorization code for tokens.

Click **CREATE**

#### 4.4 Download Credentials

A dialog will appear with your **Client ID** and **Client Secret**:

**Client ID:** `___________________________`

**Client Secret:** `___________________________`

⚠️ **Click "DOWNLOAD JSON"** - Save as `client_secrets.json`

Store this file in a **secure location** (not in the git repository).

---

## Configuration Summary

Fill in this section after completing setup:

### Project Details
```
Project ID: ___________________________
Project Name: Open Brain Integration
Project Number: _______________________
```

### OAuth Credentials
```
Client ID: _________________________________________________.apps.googleusercontent.com
Client Secret Location: ~/.secrets/openbrain/client_secrets.json (DO NOT COMMIT)
Application Type: Web application
Redirect URI: https://jeuxslbhjubxmhtzpvqf.supabase.co/functions/v1/google-auth/callback
```

### Enabled APIs
- ✅ Gmail API
- ✅ Google Calendar API
- ✅ Google Drive API
- ✅ Google Tasks API

### OAuth Scopes Configured
| Scope | Purpose |
|-------|---------|
| `gmail.readonly` | Read emails |
| `gmail.modify` | Modify labels (mark as processed) |
| `calendar.readonly` | Read calendar events |
| `calendar.events` | Create/update events |
| `drive.readonly` | Read file contents |
| `drive.metadata.readonly` | Read file metadata |
| `tasks` | Full access to Google Tasks |
| `tasks.readonly` | Read tasks |

---

## Next Steps: Complete OAuth Flow

After setting up the Google Cloud Project, you need to complete the OAuth flow to get a refresh token.

### Step 1: Store Secrets in Supabase

```bash
# Set the client ID
supabase secrets set GOOGLE_CLIENT_ID="YOUR_CLIENT_ID_HERE"

# Set the client secret
supabase secrets set GOOGLE_CLIENT_SECRET="YOUR_CLIENT_SECRET_HERE"

# Set the redirect URI
supabase secrets set GOOGLE_REDIRECT_URI="https://jeuxslbhjubxmhtzpvqf.supabase.co/functions/v1/google-auth/callback"
```

### Step 2: Deploy the google-auth Edge Function

```bash
supabase functions deploy google-auth
```

### Step 3: Initiate OAuth Flow

Visit this URL in your browser:

```
https://jeuxslbhjubxmhtzpvqf.supabase.co/functions/v1/google-auth/initiate
```

This will:
1. Redirect you to Google's OAuth consent screen
2. Ask you to authorize Open Brain
3. Redirect back to the callback endpoint
4. The Edge Function will exchange the code for tokens
5. Store the refresh token (display it in the response)

### Step 4: Store the Refresh Token

After authorization, you'll receive a refresh token. Store it:

```bash
supabase secrets set GOOGLE_REFRESH_TOKEN="YOUR_REFRESH_TOKEN_HERE"
```

---

## Publishing the App (External User Type)

If you selected **External** user type, the app starts in "Testing" mode and tokens expire after 7 days. To make it permanent:

### Option A: Keep in Testing (Development)
- Tokens expire after 7 days
- Limited to test users only
- Fine for initial development

### Option B: Publish to Production (Recommended)
1. Go to **OAuth consent screen** > **PUBLISH APP**
2. Complete the app verification process:
   - Provide app description
   - Add privacy policy URL
   - Add terms of service URL
   - Verify domain ownership
   - Complete security assessment (if required)

**Note:** For personal use with idirnet domain, keeping it as **Internal** is simplest if you have Google Workspace.

---

## Troubleshooting

### "Access Blocked" Error
If you see "This app is blocked" during OAuth:
1. Go to **OAuth consent screen**
2. Check if app is in "Testing" mode
3. Add your email as a test user
4. Or publish the app

### "Invalid redirect URI" Error
- Double-check the redirect URI matches exactly
- Must include `https://` (not `http://`)
- No trailing slash differences

### API Not Enabled Error
- Ensure all 4 APIs are enabled (Step 2)
- It can take 1-2 minutes for API activation to propagate

### Scope Errors
- Verify all required scopes are added to the OAuth consent screen
- Some scopes require sensitive scope verification for external apps

---

## Security Checklist

- [ ] `client_secrets.json` is NOT in git repository
- [ ] `client_secrets.json` is stored in secure location (~/.secrets/)
- [ ] `.gitignore` includes `client_secrets.json` and `*.secrets.*`
- [ ] Supabase secrets are set (not in code)
- [ ] Refresh token is stored securely
- [ ] OAuth consent screen is appropriate (Internal vs External)

---

## Files Generated

| File | Location | Notes |
|------|----------|-------|
| `client_secrets.json` | `~/.secrets/openbrain/` | Downloaded from Google Cloud - **NEVER COMMIT** |
| `GOOGLE_CLOUD_SETUP.md` | `~/OPENBRAIN/openBrain/` | This documentation file |

---

## Related Documentation

- [Google Workspace Integration Plan](./GOOGLE_WORKSPACE_INTEGRATION_PLAN.md)
- [Open Brain Commands](./OPEN_BRAIN_COMMANDS.md)
- [Project Status](./PROJECT_STATUS.md)

---

**Document Created:** March 17, 2026  
**Last Updated:** March 17, 2026  
**Next Review:** After OAuth flow completion
