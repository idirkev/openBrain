/**
 * Google OAuth Edge Function for Open Brain
 * 
 * Handles OAuth2 flow for Google Workspace APIs:
 * - GET /initiate - Start OAuth flow, redirect to Google
 * - GET /callback - Handle OAuth callback, exchange code for tokens
 * 
 * Required environment variables:
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 * - GOOGLE_REDIRECT_URI
 */

// Google OAuth scopes required for Open Brain
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
  "https://www.googleapis.com/auth/tasks",
  "https://www.googleapis.com/auth/tasks.readonly",
];

/**
 * Generate a cryptographically secure random state parameter
 * for CSRF protection.
 */
function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

/**
 * Build the Google OAuth authorization URL.
 */
function buildAuthUrl(
  clientId: string,
  redirectUri: string,
  state: string
): URL {
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", SCOPES.join(" "));
  authUrl.searchParams.set("access_type", "offline"); // Request refresh token
  authUrl.searchParams.set("prompt", "consent"); // Always show consent to get refresh token
  authUrl.searchParams.set("state", state);
  return authUrl;
}

/**
 * Exchange authorization code for tokens.
 */
async function exchangeCodeForTokens(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * HTML template for successful OAuth callback.
 * Displays the refresh token for manual storage.
 */
function successHtml(refreshToken: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Open Brain - Google OAuth Success</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      padding: 40px;
      max-width: 700px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .success-icon {
      width: 80px;
      height: 80px;
      background: #10b981;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 40px;
    }
    h1 {
      text-align: center;
      color: #1f2937;
      margin-bottom: 16px;
      font-size: 28px;
    }
    .message {
      text-align: center;
      color: #6b7280;
      margin-bottom: 32px;
      line-height: 1.6;
    }
    .token-section {
      background: #f3f4f6;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .token-label {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }
    .token-value {
      background: #1f2937;
      color: #10b981;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 12px;
      padding: 16px;
      border-radius: 8px;
      word-break: break-all;
      line-height: 1.5;
      user-select: all;
    }
    .copy-btn {
      display: block;
      width: 100%;
      padding: 12px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 12px;
      transition: background 0.2s;
    }
    .copy-btn:hover { background: #2563eb; }
    .copy-btn.copied { background: #10b981; }
    .steps {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px 20px;
      border-radius: 0 8px 8px 0;
    }
    .steps h3 {
      color: #92400e;
      font-size: 14px;
      margin-bottom: 12px;
    }
    .steps ol {
      margin-left: 20px;
      color: #78350f;
      font-size: 14px;
      line-height: 1.8;
    }
    .steps li { margin-bottom: 4px; }
    .warning {
      background: #fee2e2;
      border-left: 4px solid #ef4444;
      padding: 16px 20px;
      border-radius: 0 8px 8px 0;
      margin-top: 20px;
    }
    .warning h3 {
      color: #991b1b;
      font-size: 14px;
      margin-bottom: 8px;
    }
    .warning p {
      color: #7f1d1d;
      font-size: 14px;
      line-height: 1.6;
    }
    code {
      background: rgba(0,0,0,0.1);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="success-icon">✓</div>
    <h1>Authentication Successful!</h1>
    <p class="message">
      Open Brain is now authorized to access your Google Workspace data.<br>
      Copy the refresh token below and add it to your Supabase secrets.
    </p>
    
    <div class="token-section">
      <div class="token-label">Refresh Token (Save this securely)</div>
      <div class="token-value" id="token">${refreshToken}</div>
      <button class="copy-btn" id="copyBtn" onclick="copyToken()">Copy to Clipboard</button>
    </div>
    
    <div class="steps">
      <h3>📋 Next Steps</h3>
      <ol>
        <li>Click "Copy to Clipboard" above to copy the refresh token</li>
        <li>Open your terminal and run:
          <br><code>supabase secrets set GOOGLE_REFRESH_TOKEN="paste_token_here"</code>
        </li>
        <li>Deploy the updated secrets:
          <br><code>supabase secrets deploy</code>
        </li>
        <li>Test the integration with other Open Brain functions</li>
      </ol>
    </div>
    
    <div class="warning">
      <h3>⚠️ Security Notice</h3>
      <p>
        This refresh token provides ongoing access to your Google data.<br>
        • Never share it or commit it to version control<br>
        • Store it only in secure environment variables<br>
        • You can revoke access anytime at <a href="https://myaccount.google.com/permissions" target="_blank">Google Account Permissions</a>
      </p>
    </div>
  </div>
  
  <script>
    function copyToken() {
      const token = document.getElementById('token').textContent;
      const btn = document.getElementById('copyBtn');
      navigator.clipboard.writeText(token).then(() => {
        btn.textContent = '✓ Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'Copy to Clipboard';
          btn.classList.remove('copied');
        }, 2000);
      });
    }
  </script>
</body>
</html>`;
}

/**
 * HTML template for OAuth errors.
 */
function errorHtml(error: string, details?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Open Brain - Google OAuth Error</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      padding: 40px;
      max-width: 600px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .error-icon {
      width: 80px;
      height: 80px;
      background: #ef4444;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 40px;
      color: white;
    }
    h1 {
      text-align: center;
      color: #1f2937;
      margin-bottom: 16px;
      font-size: 28px;
    }
    .error-message {
      background: #fee2e2;
      border-radius: 8px;
      padding: 16px;
      color: #991b1b;
      font-weight: 500;
      text-align: center;
      margin-bottom: 16px;
    }
    .error-details {
      background: #f3f4f6;
      border-radius: 8px;
      padding: 16px;
      color: #4b5563;
      font-family: monospace;
      font-size: 12px;
      word-break: break-all;
    }
    .retry-btn {
      display: block;
      width: 100%;
      padding: 14px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 24px;
      text-decoration: none;
      text-align: center;
      transition: background 0.2s;
    }
    .retry-btn:hover { background: #2563eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="error-icon">✕</div>
    <h1>Authentication Failed</h1>
    <div class="error-message">${escapeHtml(error)}</div>
    ${details ? `<div class="error-details">${escapeHtml(details)}</div>` : ""}
    <a href="/google-auth" class="retry-btn">Try Again</a>
  </div>
</body>
</html>`;
}

/**
 * Escape HTML special characters to prevent XSS.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Main request handler.
 */
Deno.serve(async (req) => {
  // Get environment variables
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
  const redirectUri = Deno.env.get("GOOGLE_REDIRECT_URI");

  // Parse URL path
  const url = new URL(req.url);
  const path = url.pathname;

  // GET /initiate - Start OAuth flow
  if (path === "/google-auth/initiate" || path === "/initiate") {
    // Validate environment variables
    if (!clientId || !clientSecret || !redirectUri) {
      console.error("Missing required environment variables:", {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        hasRedirectUri: !!redirectUri,
      });
      return new Response(
        errorHtml(
          "Server configuration error",
          "Missing required environment variables: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_REDIRECT_URI"
        ),
        {
          status: 500,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // Generate state for CSRF protection
    const state = generateState();

    // Build auth URL
    const authUrl = buildAuthUrl(clientId, redirectUri, state);

    // Redirect to Google with state cookie
    return new Response(null, {
      status: 302,
      headers: {
        Location: authUrl.toString(),
        "Set-Cookie": `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
      },
    });
  }

  // GET /callback - Handle OAuth callback
  if (path === "/google-auth/callback" || path === "/callback") {
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    // Check for OAuth errors
    if (error) {
      console.error("OAuth error from Google:", error);
      return new Response(
        errorHtml(
          `Google OAuth error: ${error}`,
          "The user may have denied access or there was a configuration issue."
        ),
        {
          status: 400,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // Validate required parameters
    if (!code || !state) {
      return new Response(
        errorHtml(
          "Missing required parameters",
          "The callback URL must include 'code' and 'state' parameters."
        ),
        {
          status: 400,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // Validate environment variables
    if (!clientId || !clientSecret || !redirectUri) {
      console.error("Missing required environment variables for callback");
      return new Response(
        errorHtml(
          "Server configuration error",
          "Missing required environment variables for token exchange."
        ),
        {
          status: 500,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    try {
      // Exchange code for tokens
      const tokens = await exchangeCodeForTokens(
        code,
        clientId,
        clientSecret,
        redirectUri
      );

      // Check for refresh token
      if (!tokens.refresh_token) {
        console.error("No refresh token received from Google");
        return new Response(
          errorHtml(
            "No refresh token received",
            "Google did not return a refresh token. This usually happens if you've already authorized the app. Try revoking access at https://myaccount.google.com/permissions and try again."
          ),
          {
            status: 400,
            headers: { "Content-Type": "text/html" },
          }
        );
      }

      // Log success (without sensitive data)
      console.log("OAuth flow completed successfully", {
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        expiresIn: tokens.expires_in,
        scope: tokens.scope,
      });

      // Return success HTML with refresh token
      return new Response(successHtml(tokens.refresh_token), {
        status: 200,
        headers: {
          "Content-Type": "text/html",
          // Clear the state cookie
          "Set-Cookie": `oauth_state=; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
        },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Token exchange failed:", errorMessage);
      return new Response(
        errorHtml(
          "Failed to exchange authorization code for tokens",
          errorMessage
        ),
        {
          status: 500,
          headers: { "Content-Type": "text/html" },
        }
      );
    }
  }

  // Root path - show info page
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Open Brain - Google OAuth</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      padding: 40px;
      max-width: 600px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .logo {
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 50px;
    }
    h1 {
      color: #1f2937;
      margin-bottom: 16px;
      font-size: 28px;
    }
    p {
      color: #6b7280;
      margin-bottom: 24px;
      line-height: 1.6;
    }
    .scopes {
      text-align: left;
      background: #f3f4f6;
      border-radius: 8px;
      padding: 20px;
      margin: 24px 0;
    }
    .scopes h3 {
      font-size: 14px;
      color: #4b5563;
      margin-bottom: 12px;
    }
    .scopes ul {
      list-style: none;
      font-size: 13px;
      color: #6b7280;
    }
    .scopes li {
      padding: 6px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .scopes li:last-child { border-bottom: none; }
    .auth-btn {
      display: inline-block;
      padding: 16px 32px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.2s;
    }
    .auth-btn:hover { background: #2563eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🧠</div>
    <h1>Open Brain Google Authentication</h1>
    <p>
      This function handles OAuth authentication for Google Workspace APIs.<br>
      Click below to authorize Open Brain to access your Google data.
    </p>
    <div class="scopes">
      <h3>📋 Required Permissions</h3>
      <ul>
        <li>📧 Gmail (read only)</li>
        <li>📅 Calendar (read and create events)</li>
        <li>📁 Drive (read files and metadata)</li>
        <li>✅ Tasks (read and manage)</li>
      </ul>
    </div>
    <a href="/google-auth/initiate" class="auth-btn">Authenticate with Google</a>
  </div>
</body>
</html>`,
    {
      status: 200,
      headers: { "Content-Type": "text/html" },
    }
  );
});
