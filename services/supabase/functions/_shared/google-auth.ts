/**
 * Shared Google OAuth utilities for Open Brain
 * 
 * This module provides helper functions for Google OAuth token management,
 * including refreshing access tokens from stored refresh tokens.
 */

/**
 * Get a fresh access token using the stored refresh token.
 * 
 * Requires the following environment variables to be set:
 * - GOOGLE_REFRESH_TOKEN
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 * 
 * @returns A fresh access token valid for ~1 hour
 * @throws Error if credentials are missing or token refresh fails
 */
export async function getAccessToken(): Promise<string> {
  const refreshToken = Deno.env.get("GOOGLE_REFRESH_TOKEN");
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");

  if (!refreshToken) {
    throw new Error(
      "Missing GOOGLE_REFRESH_TOKEN environment variable. " +
        "Run the google-auth function to obtain a refresh token."
    );
  }
  if (!clientId) {
    throw new Error("Missing GOOGLE_CLIENT_ID environment variable");
  }
  if (!clientSecret) {
    throw new Error("Missing GOOGLE_CLIENT_SECRET environment variable");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Token refresh failed (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();

  if (!data.access_token) {
    throw new Error(
      "Token refresh response missing access_token: " + JSON.stringify(data)
    );
  }

  return data.access_token;
}

/**
 * Verify that a Google access token is valid.
 * 
 * @param accessToken The access token to verify
 * @returns Object containing token info (expires_in, scope, etc.)
 * @throws Error if token is invalid or verification fails
 */
export async function verifyAccessToken(
  accessToken: string
): Promise<Record<string, unknown>> {
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token verification failed: ${errorText}`);
  }

  return await response.json();
}
