import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertDiscordUserSchema } from "@shared/schema";
import CrossEnvironmentOAuthManager from "./oauth-config";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil",
});

// VIP Membership Price ID (need to create price in Stripe Dashboard)
const VIP_PRICE_ID = process.env.STRIPE_PRICE_ID || "price_1QZ9H9L2ZxQQbCf4qxQQbCf4";

// Discord OAuth2 configuration
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_GUILD_ID = "1357437337537220719"; // Crypto Vanguard Discord server ID
// Use the cross-environment OAuth manager for redirect URIs
const getDiscordRedirectUri = (req: any) => {
  const environment = CrossEnvironmentOAuthManager.detectEnvironment(req);
  return environment.redirectUri;
};

if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
  throw new Error("Missing Discord OAuth2 credentials");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Debug endpoint to check Discord OAuth configuration
  app.get("/api/auth/discord/config", (req, res) => {
    const environment = CrossEnvironmentOAuthManager.detectEnvironment(req);
    res.json({
      clientId: DISCORD_CLIENT_ID,
      currentEnvironment: environment,
      allPossibleRedirectUris: CrossEnvironmentOAuthManager.generateAllRedirectUris(),
      setupInstructions: CrossEnvironmentOAuthManager.getDiscordConfigInstructions(DISCORD_CLIENT_ID || ''),
      replit_domains: process.env.REPLIT_DOMAINS
    });
  });

  // New endpoint to generate OAuth setup instructions
  app.get("/api/auth/discord/setup-guide", (req, res) => {
    res.json({
      instructions: CrossEnvironmentOAuthManager.getDiscordConfigInstructions(DISCORD_CLIENT_ID || ''),
      allRedirectUris: CrossEnvironmentOAuthManager.generateAllRedirectUris(),
      currentEnvironment: CrossEnvironmentOAuthManager.detectEnvironment(req)
    });
  });

  // Discord OAuth2 authentication initiation
  app.get("/api/auth/discord", (req, res) => {
    const environment = CrossEnvironmentOAuthManager.detectEnvironment(req);
    const redirectUri = environment.redirectUri;
    
    // Validate redirect URI
    if (!CrossEnvironmentOAuthManager.validateRedirectUri(redirectUri, req)) {
      console.error('Invalid redirect URI detected:', redirectUri);
      return res.status(400).json({ error: 'Invalid redirect URI configuration' });
    }
    
    const scopes = ['identify', 'guilds', 'email'].join('%20');
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}`;
    
    console.log('Discord OAuth URL:', discordAuthUrl);
    console.log('Environment:', environment.name);
    console.log('Using redirect URI:', redirectUri);
    
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
      const redirectUri = getDiscordRedirectUri(req);
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
          redirect_uri: redirectUri,
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
      
      console.log('Discord user guilds:', guilds.map((g: any) => ({ id: g.id, name: g.name })));
      console.log('Looking for guild ID:', DISCORD_GUILD_ID);
      
      const isServerMember = guilds.some((guild: any) => guild.id === DISCORD_GUILD_ID);
      
      console.log('Is server member check:', isServerMember);

      // Check if user is a member of the Crypto Vanguard server
      const actualIsServerMember = isServerMember;
      
      if (!actualIsServerMember) {
        console.log('User is not a member of Crypto Vanguard server');
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
        isServerMember: actualIsServerMember,
        isVipMember,
      };

      const user = await storage.createOrUpdateDiscordUser(userData);

      // Store user in session
      req.session.userId = user.id;
      
      console.log('Discord user authenticated:', user.discordUsername, 'Server member:', actualIsServerMember, 'User ID:', user.id);
      
      // Redirect to VIP community page
      res.redirect('/vip-community?auth=success');
    } catch (error: any) {
      console.error('Discord OAuth error:', error);
      res.redirect('/vip-community?error=auth_failed');
    }
  });

  // Get current Discord user info
  app.get("/api/auth/user", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.json({ user: null });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        delete req.session.userId;
        return res.json({ user: null });
      }

      res.json({ user });
    } catch (error) {
      console.error('Error getting user:', error);
      res.json({ user: null });
    }
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

  // VIP subscription management
  app.post("/api/create-vip-subscription", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      
      // Check if user is already VIP
      if (user.isVipMember && user.subscriptionStatus === 'active') {
        return res.json({ redirect: "/vip-member" });
      }

      let customerId = user.stripeCustomerId;
      
      // Create Stripe customer if not exists
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: user.id.toString(),
            discordId: user.discordId || "",
            discordUsername: user.discordUsername || ""
          }
        });
        customerId = customer.id;
        await storage.updateStripeCustomerId(user.id, customerId);
      }

      // Create checkout session with test price for demo
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'jpy',
              product_data: {
                name: 'VIP メンバーシップ',
                description: '全てのDiscord VIPチャンネルアクセス、専門的なレポートの定期配信',
              },
              recurring: {
                interval: 'month',
              },
              unit_amount: 10000, // Debugged JPY doesn't use decimals
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${req.protocol}://${req.get('host')}/vip-member?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get('host')}/vip`,
        metadata: {
          userId: user.id.toString(),
        },
      });

      console.log('Stripe checkout session created:', session.id, session.url);
      res.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
      console.error('VIP subscription error:', error);
      res.status(500).json({ error: 'Failed to create subscription' });
    }
  });

  // Cancel VIP subscription
  app.post("/api/cancel-vip-subscription", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user || !user.stripeSubscriptionId) {
        return res.status(400).json({ error: "No active subscription found" });
      }

      // Cancel at period end
      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error('VIP cancellation error:', error);
      res.status(500).json({ error: 'Failed to cancel subscription' });
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

  // Discord role management helper functions
  async function assignVipRole(discordId: string) {
    if (!discordId) return;
    
    try {
      const response = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordId}/roles/VIP`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('Failed to assign VIP role:', await response.text());
      }
    } catch (error) {
      console.error('Discord role assignment error:', error);
    }
  }

  async function removeVipRole(discordId: string) {
    if (!discordId) return;
    
    try {
      const response = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordId}/roles/VIP`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('Failed to remove VIP role:', await response.text());
      }
    } catch (error) {
      console.error('Discord role removal error:', error);
    }
  }

  // Stripe webhook handler for VIP subscription events
  app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    let event;

    try {
      const sig = req.headers['stripe-signature'];
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        throw new Error('Missing Stripe webhook secret');
      }
      event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`🔔 Stripe event: ${event.type}`);

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.userId;
          
          if (userId && session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
            const user = await storage.getUser(parseInt(userId));
            
            if (user) {
              // Update user subscription info
              await storage.updateSubscriptionInfo(parseInt(userId), {
                stripeSubscriptionId: subscription.id,
                subscriptionStatus: subscription.status,
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
              });

              // Assign VIP role in Discord
              if (user.discordId) {
                await assignVipRole(user.discordId);
              }
            }
          }
          break;
        }

        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          const user = await storage.getUserByStripeCustomerId(subscription.customer as string);
          
          if (user) {
            await storage.updateSubscriptionInfo(user.id, {
              stripeSubscriptionId: subscription.id,
              subscriptionStatus: subscription.status,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            });
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const user = await storage.getUserByStripeCustomerId(subscription.customer as string);
          
          if (user) {
            // Remove VIP status and Discord role
            await storage.updateVipStatus(user.id, false);
            if (user.discordId) {
              await removeVipRole(user.discordId);
            }
          }
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          if (invoice.subscription) {
            const user = await storage.getUserByStripeCustomerId(invoice.customer as string);
            
            if (user) {
              // Remove VIP status and Discord role on payment failure
              await storage.updateVipStatus(user.id, false);
              if (user.discordId) {
                await removeVipRole(user.discordId);
              }
            }
          }
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
      return res.status(500).json({ error: 'Webhook processing failed' });
    }

    res.json({ received: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
