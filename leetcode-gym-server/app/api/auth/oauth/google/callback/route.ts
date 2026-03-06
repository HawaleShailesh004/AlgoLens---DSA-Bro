import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

/**
 * GET /api/auth/oauth/google/callback
 * Handles Google OAuth callback
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`/login?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect("/login?error=no_code");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/oauth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect("/login?error=oauth_not_configured");
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
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

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token exchange error:", errorData);
      return NextResponse.redirect("/login?error=token_exchange_failed");
    }

    const tokenData = await tokenResponse.json() as { access_token: string };
    const accessToken = tokenData.access_token;

    // Get user info from Google
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      return NextResponse.redirect("/login?error=user_info_failed");
    }

    const userData = await userResponse.json() as { email: string; name?: string; id: string };
    const email = userData.email;

    if (!email) {
      return NextResponse.redirect("/login?error=no_email");
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      // Create new user (no password for OAuth users)
      user = await prisma.user.create({
        data: {
          email,
          password: "", // OAuth users don't have passwords
        },
      });
    }

    // Generate JWT token
    const token = await signToken(user.id, user.email);

    // Redirect to dashboard with token in URL (will be consumed by layout)
    const dashboardUrl = `/dashboard?token=${encodeURIComponent(token)}`;
    return NextResponse.redirect(dashboardUrl);
  } catch (e) {
    console.error("OAuth callback error:", e);
    return NextResponse.redirect("/login?error=oauth_error");
  }
}
