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

// Discord Bot Token for role management (requires bot permissions)
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_SERVER_ID = "1357437337537220719"; // Crypto Vanguard server ID
const VIP_ROLE_ID = process.env.DISCORD_VIP_ROLE_ID; // VIP role ID (needs to be set)

// Function to assign/remove VIP role
async function assignDiscordVipRole(discordUserId: string, assign: boolean) {
  if (!DISCORD_BOT_TOKEN || !VIP_ROLE_ID) {
    console.log('Discord bot token or VIP role ID not configured, skipping role assignment');
    return;
  }

  try {
    const url = `https://discord.com/api/guilds/${DISCORD_SERVER_ID}/members/${discordUserId}/roles/${VIP_ROLE_ID}`;
    const method = assign ? 'PUT' : 'DELETE';

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      console.log(`${assign ? 'Assigned' : 'Removed'} VIP role for Discord user: ${discordUserId}`);
    } else {
      console.error(`Failed to ${assign ? 'assign' : 'remove'} VIP role:`, response.status, await response.text());
    }
  } catch (error) {
    console.error('Error managing Discord VIP role:', error);
  }
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

      console.log('Discord user data:', discordUser);
      console.log('Discord user ID:', discordUser.id);
      console.log('Discord user ID type:', typeof discordUser.id);

      if (!discordUser.id) {
        console.error('Discord user object:', JSON.stringify(discordUser, null, 2));
        throw new Error('Discord user ID not found in API response');
      }

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
        res.redirect('/vip-community?error=not_member');
        return;
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
      console.log('Session before save:', {
        sessionId: req.sessionID,
        userId: req.session.userId,
        sessionStore: !!req.sessionStore
      });

      // Debug session state before save
      console.log('Session before save attempt:', {
        sessionId: req.sessionID,
        userId: req.session.userId,
        sessionStore: req.sessionStore ? req.sessionStore.constructor.name : 'none',
        hasSessionStore: !!req.sessionStore
      });

      // Save session with enhanced error handling
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          console.error('Session save error details:', {
            message: err.message,
            stack: err.stack,
            sessionId: req.sessionID,
            userId: user.id,
            sessionStoreType: req.sessionStore ? req.sessionStore.constructor.name : 'none'
          });
          
          // Force session assignment and redirect anyway
          req.session.userId = user.id;
          console.log('Forced session assignment, redirecting despite save error...');
          res.redirect('/vip-community?auth=success&session_warning=true');
          return;
        }
        
        console.log('Session saved successfully for user:', user.id);
        console.log('Session after save:', {
          sessionId: req.sessionID,
          userId: req.session.userId,
          sessionAge: req.session.cookie.maxAge
        });
        
        // Redirect to VIP community page
        res.redirect('/vip-community?auth=success');
      });
      return;
    } catch (error: any) {
      console.error('Discord OAuth error:', error);
      res.redirect('/vip-community?error=auth_failed');
      return;
    }
  });

  // UNIX 秒(number) と ISO8601 文字列(string) の両方を安全に Date | null に変換する
  const toDate = (ts: number | string | null | undefined) => {
    if (!ts) return null;                          // null / undefined
    const d = typeof ts === 'number'
      ? new Date(ts * 1000)                        // 旧 API: 秒 → ms
      : new Date(ts);                              // 新 API: ISO 文字列
    return isNaN(d.getTime()) ? null : d;          // NaN → null
  };

  // Get current Discord user info with subscription details
  app.get("/api/auth/user", async (req, res) => {
    try {
      console.log('Auth user endpoint called:', {
        sessionId: req.sessionID,
        userId: req.session.userId,
        hasSession: !!req.session,
        sessionKeys: Object.keys(req.session || {}),
        sessionStore: req.sessionStore ? req.sessionStore.constructor.name : 'none',
        cookie: req.session.cookie
      });
      
      if (!req.session.userId) {
        console.log('No userId in session, returning null user');
        return res.json({ user: null });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        delete req.session.userId;
        return res.json({ user: null });
      }

      let subscriptionInfo = null;

      // --- Stripe からサブスク詳細を取得 ---
      if (user.stripeSubscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(
            user.stripeSubscriptionId,
            { expand: ['latest_invoice'] }   // 既存の expand 指定
          );

          const periodEndRaw =
            subscription.current_period_end ??
            (subscription.latest_invoice as Stripe.Invoice | null)?.period_end;
          const nextPaymentDate = toDate(periodEndRaw);

          if (nextPaymentDate) {
            subscriptionInfo = {
              nextPaymentDate: nextPaymentDate.toISOString(),
              nextPaymentAmount:
                subscription.latest_invoice
                  ? subscription.latest_invoice.amount_due
                  : subscription.items.data[0].price.unit_amount,
              serviceEndDate: subscription.cancel_at_period_end
                ? nextPaymentDate.toISOString()
                : null,
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
              status: subscription.status,
            };
          } else {
            // フォールバック
            subscriptionInfo = {
              error: true,
              nextPaymentDate: null,
              nextPaymentAmount: 0,
              serviceEndDate: null,
              cancelAtPeriodEnd: false,
              status: 'error',
            };
          }
        } catch (stripeError) {
          console.error('Error fetching subscription:', stripeError);
        }
      }

      /* ===== ★★ ここから自己修復ブロック ★★ ===== */
      if (subscriptionInfo) {
        const shouldBeVip = subscriptionInfo.status === 'active';

        if (shouldBeVip !== user.isVipMember) {
          // DB を修正
          await storage.updateUser(user.id, { isVipMember: shouldBeVip });

          // Discord 側も同期
          if (user.discordId) {
            await assignDiscordVipRole(user.discordId, shouldBeVip);
          }

          // レスポンスに反映（メモリ上の user オブジェクトも更新）
          user.isVipMember = shouldBeVip;
        }
      }
      /* ===== ★★ ここまで追加 ★★ ===== */

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
        success_url: `${req.protocol}://${req.get('host')}/vip-member?payment=success`,
        cancel_url: `${req.protocol}://${req.get('host')}/vip-community?canceled=true`,
        metadata: {
          userId: user.id.toString(),
        },
      });

      return res.json({ checkoutUrl: session.url });
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
        // 旧）subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        // 新）数値でも文字列でも安全に変換
        subscriptionCurrentPeriodEnd: toDate(subscription.current_period_end)
      });

      return res.json({ success: true, subscription });
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      res.status(500).json({ message: "Error canceling subscription: " + error.message });
    }
  });

  // Stripe webhooks
  app.post("/api/stripe/webhook", async (req, res) => {
    console.log('Webhook received:', {
      headers: req.headers,
      body: req.body ? 'Present' : 'Missing',
      signature: req.headers['stripe-signature'] ? 'Present' : 'Missing'
    });

    const sig = req.headers['stripe-signature'];
    let event;

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET environment variable is not set');
      return res.status(500).send('Webhook secret not configured');
    }

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      console.log('Webhook event verified:', event.type);
    } catch (err: any) {
      console.error(`Webhook signature verification failed:`, err.message);
      console.error('Expected endpoint secret:', process.env.STRIPE_WEBHOOK_SECRET ? 'Set' : 'Not set');
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      console.log('Processing webhook event:', event.type, 'ID:', event.id);

      switch (event.type) {
        case 'checkout.session.completed':
          console.log('Processing checkout.session.completed');
          const session = event.data.object;
          const userId = parseInt(session.metadata.userId);
          console.log('Session metadata userId:', session.metadata.userId);

          if (session.mode === 'subscription') {
            // const subscription = await stripe.subscriptions.retrieve(session.subscription);
            const subscription = await stripe.subscriptions.retrieve(
              session.subscription as string,
              { expand: ['latest_invoice'] }        // ★ 追加
            );

            // await storage.updateUserSubscriptionInfo(userId, {
            // period_end → current_period_end が無ければ latest_invoice.period_end
            const periodEndRaw =
              subscription.current_period_end ??
              (subscription.latest_invoice as Stripe.Invoice | null)?.period_end;

            await storage.updateUserSubscriptionInfo(userId, {
              stripeSubscriptionId: subscription.id,
              subscriptionStatus: subscription.status,
              subscriptionCancelAtPeriodEnd: subscription.cancel_at_period_end,
              // 旧）subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
              // 新）数値でも文字列でも安全に変換
              // subscriptionCurrentPeriodEnd: toDate(subscription.current_period_end),
              // subscriptionNextPaymentAmount: (subscription.items.data[0].price.unit_amount).toString(),
              subscriptionCurrentPeriodEnd: toDate(periodEndRaw),
              subscriptionNextPaymentAmount: (
                subscription.latest_invoice
                  ? subscription.latest_invoice.amount_due /
                      (subscription.currency === 'jpy' ? 1 : 100)
                  : subscription.items.data[0].price.unit_amount /
                      (subscription.currency === 'jpy' ? 1 : 100)
              ).toString(),              
              isVipMember: true,
            });

            // Add VIP role to Discord user
            const user = await storage.getUser(userId);
            if (user && user.discordId) {
              await assignDiscordVipRole(user.discordId, true);
            }
          }
          break;

        /*case 'customer.subscription.updated':
          const updatedSubscription = event.data.object;
          const customer = await stripe.customers.retrieve(updatedSubscription.customer);
          const userForUpdate = await storage.getUser(parseInt(customer.metadata?.userId || '0'));

          if (userForUpdate) {
            await storage.updateUserSubscriptionInfo(userForUpdate.id, {
              subscriptionStatus: updatedSubscription.status,
              subscriptionCancelAtPeriodEnd: updatedSubscription.cancel_at_period_end,
              subscriptionCurrentPeriodEnd: toDate(updatedSubscription.current_period_end),
              subscriptionNextPaymentAmount: (updatedSubscription.items.data[0].price.unit_amount).toString(),
            });
          }
          break;*/

        case 'customer.subscription.updated': {
          const updated = event.data.object as Stripe.Subscription;
          const customer = await stripe.customers.retrieve(updated.customer);
          const user = await storage.getUser(parseInt(customer.metadata?.userId || '0'));

          if (user) {
            const isActive = updated.status === 'active';

            await storage.updateUserSubscriptionInfo(user.id, {
              subscriptionStatus: updated.status,
              subscriptionCancelAtPeriodEnd: updated.cancel_at_period_end,
              subscriptionCurrentPeriodEnd: toDate(updated.current_period_end),
              subscriptionNextPaymentAmount: String(updated.items.data[0].price.unit_amount),
              isVipMember: isActive,               // ★ 追加
            });

            if (user.discordId) {
              await assignDiscordVipRole(user.discordId, isActive);  // ★ 追加
            }
          }
          break;
        }

        case 'customer.subscription.deleted':
          const deletedSubscription = event.data.object;
          const deletedCustomer = await stripe.customers.retrieve(deletedSubscription.customer);
          const userForDeletion = await storage.getUser(parseInt(deletedCustomer.metadata?.userId || '0'));

          if (userForDeletion) {
            await storage.updateUserSubscriptionInfo(userForDeletion.id, {
              subscriptionStatus: 'canceled',
              isVipMember: false,
            });

            // Remove VIP role from Discord user
            if (userForDeletion.discordId) {
              await assignDiscordVipRole(userForDeletion.discordId, false);
            }
          }
          break;

        case 'invoice.payment_failed':
          const failedInvoice = event.data.object;
          const failedCustomer = await stripe.customers.retrieve(failedInvoice.customer);
          const userForFailure = await storage.getUser(parseInt(failedCustomer.metadata?.userId || '0'));

          if (userForFailure) {
            await storage.updateUserSubscriptionInfo(userForFailure.id, {
              subscriptionStatus: 'past_due',
            });
          }
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      return res.json({ received: true });
    } catch (error: any) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}