import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { db } from "@/db";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

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

// Configure session store based on environment
const isProduction = process.env.NODE_ENV === "production";
let sessionStore;

if (process.env.DATABASE_URL) {
  try {
    console.log('🔄 Configuring PostgreSQL session store...');
    const PgSession = connectPgSimple(session);
    sessionStore = new PgSession({
      conString: process.env.DATABASE_URL,
      tableName: 'user_sessions',
      createTableIfMissing: true,
      pruneSessionInterval: 60 * 5, // Remove expired sessions every 5 minutes
      errorLog: (err: any) => {
        console.error('❌ PostgreSQL session store error:', err);
      }
    });
    console.log('✅ PostgreSQL session store configured successfully');
    console.log('Session store type:', sessionStore.constructor.name);
    
    // Test the session store connection with more details
    sessionStore.on('connect', () => {
      console.log('🔗 Session store connected to PostgreSQL');
    });
    
    sessionStore.on('disconnect', () => {
      console.log('💔 Session store disconnected from PostgreSQL');
    });
    
    // Test session store functionality
    console.log('🧪 Testing session store...');
    
  } catch (error) {
    console.error('❌ Failed to configure PostgreSQL session store:', error);
    console.log('⚠️ Falling back to memory store');
    sessionStore = undefined;
  }
} else {
  console.warn('⚠️ DATABASE_URL not set, using memory store');
  console.log('Environment:', process.env.NODE_ENV);
}

app.use(
  session({
    store: sessionStore, // Use database store in production, memory store in development
    secret: process.env.SESSION_SECRET || "dev-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset expiration on each request
    cookie: {
      secure: isProduction,
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: isProduction ? 'lax' : 'lax', // CSRF protection
    },
    name: 'connect.sid', // Explicit session name
  }),
);

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
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
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