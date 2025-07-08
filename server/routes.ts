import type { Express } from "express";
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

  // Get current Discord user info with subscription details
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

      let subscriptionInfo = null;

      // Fetch subscription details from Stripe if user has a subscription
      if (user.stripeSubscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          subscriptionInfo = {
            nextPaymentDate: new Date(subscription.current_period_end * 1000).toISOString(),
            nextPaymentAmount: subscription.items.data[0].price.unit_amount / 100,
            serviceEndDate: subscription.cancel_at_period_end ? 
              new Date(subscription.current_period_end * 1000).toISOString() : null,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            status: subscription.status,
          };
        } catch (stripeError) {
          console.error('Error fetching subscription from Stripe:', stripeError);
        }
      }

      res.json({ 
        user: {
          ...user,
          subscriptionInfo
        }
      });
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

  // VIP Subscription endpoints
  app.post("/api/stripe/create-subscription", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      // Check if user already has active VIP membership
      if (user.isVipMember && user.subscriptionStatus === 'active') {
        return res.json({ redirectTo: '/vip-member' });
      }

      // Check if user already has a Stripe customer
      let stripeCustomer;
      if (user.stripeCustomerId) {
        stripeCustomer = await stripe.customers.retrieve(user.stripeCustomerId);
      } else {
        stripeCustomer = await stripe.customers.create({
          email: user.email || `${user.username}@example.com`,
          metadata: {
            userId: user.id.toString(),
            discordId: user.discordId || '',
          },
        });
        await storage.updateStripeCustomerId(user.id, stripeCustomer.id);
      }

      // Create checkout session for VIP membership subscription
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: "price_1Ri54QP8o8opCBObRxwWJESR", // VIP Membership Price ID
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${req.protocol}://${req.get('host')}/vip-member?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get('host')}/vip-community?canceled=true`,
        metadata: {
          userId: user.id.toString(),
        },
      });

      res.json({ checkoutUrl: session.url });
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ message: "Error creating subscription: " + error.message });
    }
  });

  // Cancel subscription
  app.post("/api/stripe/cancel-subscription", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      if (!user.stripeSubscriptionId) {
        return res.status(400).json({ message: "No active subscription found" });
      }

      // Update subscription to cancel at period end
      const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      // Update user subscription info
      await storage.updateUserSubscriptionInfo(user.id, {
        subscriptionCancelAtPeriodEnd: true,
        subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      });

      res.json({ success: true, subscription });
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      res.status(500).json({ message: "Error canceling subscription: " + error.message });
    }
  });

  // Stripe webhooks
  app.post("/api/stripe/webhook", async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object;
          const userId = parseInt(session.metadata.userId);
          
          if (session.mode === 'subscription') {
            const subscription = await stripe.subscriptions.retrieve(session.subscription);
            
            await storage.updateUserSubscriptionInfo(userId, {
              stripeSubscriptionId: subscription.id,
              subscriptionStatus: subscription.status,
              subscriptionCancelAtPeriodEnd: subscription.cancel_at_period_end,
              subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
              subscriptionNextPaymentAmount: (subscription.items.data[0].price.unit_amount / 100).toString(),
              isVipMember: true,
            });
          }
          break;

        case 'customer.subscription.updated':
          const updatedSubscription = event.data.object;
          const customer = await stripe.customers.retrieve(updatedSubscription.customer);
          const userForUpdate = await storage.getUserByUsername(customer.metadata?.userId || '');
          
          if (userForUpdate) {
            await storage.updateUserSubscriptionInfo(userForUpdate.id, {
              subscriptionStatus: updatedSubscription.status,
              subscriptionCancelAtPeriodEnd: updatedSubscription.cancel_at_period_end,
              subscriptionCurrentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
              subscriptionNextPaymentAmount: (updatedSubscription.items.data[0].price.unit_amount / 100).toString(),
            });
          }
          break;

        case 'customer.subscription.deleted':
          const deletedSubscription = event.data.object;
          const deletedCustomer = await stripe.customers.retrieve(deletedSubscription.customer);
          const userForDeletion = await storage.getUserByUsername(deletedCustomer.metadata?.userId || '');
          
          if (userForDeletion) {
            await storage.updateUserSubscriptionInfo(userForDeletion.id, {
              subscriptionStatus: 'canceled',
              isVipMember: false,
            });
          }
          break;

        case 'invoice.payment_failed':
          const failedInvoice = event.data.object;
          const failedCustomer = await stripe.customers.retrieve(failedInvoice.customer);
          const userForFailure = await storage.getUserByUsername(failedCustomer.metadata?.userId || '');
          
          if (userForFailure) {
            await storage.updateUserSubscriptionInfo(userForFailure.id, {
              subscriptionStatus: 'past_due',
            });
          }
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
