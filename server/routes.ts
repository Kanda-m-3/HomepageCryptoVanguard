import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertDiscordUserSchema } from "@shared/schema";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil",
});

// Discord OAuth2 configuration
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_GUILD_ID = "1383003178584510524"; // Your Discord server ID
// Determine the correct base URL for redirects
const getBaseUrl = () => {
  if (process.env.REPLIT_DOMAINS) {
    return `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`;
  }
  return 'http://localhost:5000';
};

const DISCORD_REDIRECT_URI = `${getBaseUrl()}/api/auth/discord/callback`;

if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
  throw new Error("Missing Discord OAuth2 credentials");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Debug endpoint to check Discord OAuth configuration
  app.get("/api/auth/discord/config", (req, res) => {
    res.json({
      clientId: DISCORD_CLIENT_ID,
      redirectUri: DISCORD_REDIRECT_URI,
      baseUrl: getBaseUrl(),
      replit_domains: process.env.REPLIT_DOMAINS,
      hasClientSecret: !!DISCORD_CLIENT_SECRET,
      fullOAuthUrl: `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20guilds%20email`
    });
  });

  // Test endpoint for debugging Discord application
  app.get("/api/auth/discord/test", (req, res) => {
    res.json({
      message: "This endpoint tests if the Discord application is properly configured",
      instructions: [
        "1. Go to https://discord.com/developers/applications",
        "2. Select your Crypto Vanguard application",
        "3. In the OAuth2 section, make sure:",
        "   - Redirect URIs includes: " + DISCORD_REDIRECT_URI,
        "   - Client Secret is properly set",
        "   - Application has 'bot' and 'applications.commands' scopes if needed",
        "4. Try the OAuth URL manually:",
        `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20guilds%20email`
      ]
    });
  });

  // Discord OAuth2 authentication initiation
  app.get("/api/auth/discord", (req, res) => {
    try {
      // Validate Discord configuration
      if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
        throw new Error('Discord OAuth2 credentials not configured');
      }

      const scopes = ['identify', 'guilds', 'email'].join('%20');
      const state = Math.random().toString(36).substring(7); // Simple state for CSRF protection
      const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=${scopes}&state=${state}`;
      
      console.log('Discord OAuth URL:', discordAuthUrl);
      console.log('Client ID:', DISCORD_CLIENT_ID);
      console.log('Redirect URI:', DISCORD_REDIRECT_URI);
      
      res.redirect(discordAuthUrl);
    } catch (error) {
      console.error('Discord OAuth initiation error:', error);
      res.status(500).json({ error: 'Discord OAuth configuration error' });
    }
  });

  // Discord OAuth2 callback
  app.get("/api/auth/discord/callback", async (req, res) => {
    const { code, error } = req.query;

    console.log('Discord callback received:', { code: !!code, error, query: req.query });

    if (error) {
      console.error('Discord OAuth error:', error);
      return res.redirect('/vip-community?error=oauth_error');
    }

    if (!code) {
      console.error('No authorization code provided');
      return res.redirect('/vip-community?error=no_code');
    }

    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: DISCORD_CLIENT_ID!,
          client_secret: DISCORD_CLIENT_SECRET!,
          grant_type: 'authorization_code',
          code: code as string,
          redirect_uri: DISCORD_REDIRECT_URI,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error(`Discord token exchange failed: ${tokenData.error}`);
      }

      // Get user information
      const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      const discordUser = await userResponse.json();

      // Get user's guilds to check server membership
      const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      const guilds = await guildsResponse.json();
      const isServerMember = guilds.some((guild: any) => guild.id === DISCORD_GUILD_ID);

      if (!isServerMember) {
        // Redirect to Discord server join page
        return res.redirect('/vip-community?error=not_member');
      }

      // Check if user has VIP role (this would require bot token to get guild member info)
      // For now, we'll set it to false and implement VIP checking later
      const isVipMember = false;

      // Create or update Discord user in database
      const userData = {
        discordId: discordUser.id,
        discordUsername: discordUser.username,
        discordAvatar: discordUser.avatar,
        email: discordUser.email,
        isServerMember: true,
        isVipMember,
      };

      const user = await storage.createOrUpdateDiscordUser(userData);

      // Set user session
      (req as any).session.userId = user.id;
      (req as any).session.discordUser = user;

      console.log('User authenticated successfully:', { userId: user.id, username: user.username });
      res.redirect('/vip-community?auth=success');
    } catch (error: any) {
      console.error('Discord OAuth error:', error);
      res.redirect('/vip-community?error=auth_failed');
    }
  });

  // Get current Discord user info
  app.get("/api/auth/user", async (req, res) => {
    try {
      const session = (req as any).session;
      if (session && session.userId) {
        const user = await storage.getUser(session.userId);
        res.json({ user });
      } else {
        res.json({ user: null });
      }
    } catch (error) {
      console.error('Error getting user:', error);
      res.json({ user: null });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    (req as any).session.destroy((err: any) => {
      if (err) {
        console.error('Session destroy error:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ success: true });
    });
  });

  // Get crypto prices from CoinGecko API
  app.get("/api/crypto-prices", async (req, res) => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple,binancecoin,solana,dogecoin,the-open-network,shiba-inu,cardano,avalanche-2&vs_currencies=usd&include_24hr_change=true",
      );
      if (!response.ok) {
        throw new Error("Failed to fetch crypto prices");
      }
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Error fetching crypto prices: " + error.message });
    }
  });

  // Get all analytical reports
  app.get("/api/reports", async (req, res) => {
    try {
      const reports = await storage.getAllReports();
      res.json(reports);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Error fetching reports: " + error.message });
    }
  });

  // Get free sample reports
  app.get("/api/reports/samples", async (req, res) => {
    try {
      const reports = await storage.getFreeSampleReports();
      res.json(reports);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Error fetching sample reports: " + error.message });
    }
  });

  // Get specific report
  app.get("/api/reports/:id", async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      const report = await storage.getReport(reportId);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      res.json(report);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Error fetching report: " + error.message });
    }
  });

  // Create payment intent for report purchase
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { reportId } = req.body;

      if (!reportId) {
        return res.status(400).json({ message: "Report ID is required" });
      }

      const report = await storage.getReport(reportId);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      const amount = Math.round(parseFloat(report.price)); // Debugged Not Convert to cents

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "jpy", // Japanese Yen
        metadata: {
          reportId: reportId.toString(),
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        amount: amount,
      });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Confirm purchase after successful payment
  app.post("/api/confirm-purchase", async (req, res) => {
    try {
      const { paymentIntentId, reportId } = req.body;

      if (!paymentIntentId || !reportId) {
        return res
          .status(400)
          .json({ message: "Payment intent ID and report ID are required" });
      }

      // Verify payment with Stripe
      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({ message: "Payment not completed" });
      }

      const report = await storage.getReport(reportId);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      // Create purchase record
      const purchase = await storage.createPurchase({
        userId: null, // Anonymous purchase for now
        reportId,
        stripePaymentIntentId: paymentIntentId,
        amount: report.price,
      });

      res.json({
        success: true,
        purchase,
        downloadUrl: report.fileUrl,
      });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Error confirming purchase: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
