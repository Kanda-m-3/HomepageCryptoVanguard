import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

const app = express();

// Raw body parser for Stripe webhooks
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// Parse JSON bodies for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure session middleware with PostgreSQL store
const PgSession = connectPgSimple(session);

const sessionConfig = {
  store: new PgSession({
    pool: db, // Use existing database connection
    tableName: 'user_sessions',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'crypto-vanguard-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Enable secure cookies in production
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true, // Prevent XSS attacks
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Deploy環境でクロスサイト対応
    domain: process.env.NODE_ENV === 'production' ? undefined : undefined // ドメイン指定なし
  },
  name: 'sessionId' // Change default session name for security
};

console.log('=== SESSION CONFIGURATION ===');
console.log('Environment:', process.env.NODE_ENV);
console.log('Session config:', {
  ...sessionConfig,
  secret: '[HIDDEN]',
  cookie: {
    ...sessionConfig.cookie,
    sameSite: sessionConfig.cookie.sameSite,
    secure: sessionConfig.cookie.secure,
    domain: sessionConfig.cookie.domain || 'undefined'
  }
});

app.use(session(sessionConfig));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      
      // Add session info for auth-related endpoints
      if (path.includes('/auth/')) {
        const sessionInfo = {
          sessionId: req.sessionID,
          userId: req.session.userId || 'none',
          hasSession: !!req.session.userId
        };
        logLine += ` [Session: ${JSON.stringify(sessionInfo)}]`;
      }
      
      if (capturedJsonResponse) {
        // Truncate response for readability but include user info if present
        let responseStr = JSON.stringify(capturedJsonResponse);
        if (capturedJsonResponse.user) {
          responseStr = JSON.stringify({
            user: capturedJsonResponse.user ? {
              id: capturedJsonResponse.user.id,
              username: capturedJsonResponse.user.username,
              isVipMember: capturedJsonResponse.user.isVipMember
            } : null
          });
        }
        logLine += ` :: ${responseStr}`;
      }

      if (logLine.length > 200) {
        logLine = logLine.slice(0, 199) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
