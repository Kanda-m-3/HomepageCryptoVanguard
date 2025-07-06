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
const DISCORD_REDIRECT_URI = process.env.NODE_ENV === 'production' 
  ? `https://${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost'}/api/auth/discord/callback`
  : 'http://localhost:5000/api/auth/discord/callback';

if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
  throw new Error("Missing Discord OAuth2 credentials");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Discord OAuth2 authentication initiation
  app.get("/api/auth/discord", (req, res) => {
    const scopes = ['identify', 'guilds', 'email'].join('%20');
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=${scopes}`;
    res.redirect(discordAuthUrl);
  });

  // Discord OAuth2 callback
  app.get("/api/auth/discord/callback", async (req, res) => {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: "No authorization code provided" });
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

      // Set user session/auth token (for now, just redirect with success)
      res.redirect('/vip-community?auth=success');
    } catch (error: any) {
      console.error('Discord OAuth error:', error);
      res.redirect('/vip-community?error=auth_failed');
    }
  });

  // Get current Discord user info
  app.get("/api/auth/user", async (req, res) => {
    // TODO: Implement proper session management
    // For now, return null (not authenticated)
    res.json({ user: null });
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
