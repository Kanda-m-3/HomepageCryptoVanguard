import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { generateDownloadUrl, fileExists } from "./objectStorage";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil",
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get crypto prices from CoinGecko API
  app.get("/api/crypto-prices", async (req, res) => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple,binancecoin,solana,dogecoin,the-open-network,shiba-inu,cardano,avalanche-2&vs_currencies=usd&include_24hr_change=true'
      );
      if (!response.ok) {
        throw new Error('Failed to fetch crypto prices');
      }
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching crypto prices: " + error.message });
    }
  });

  // Get all analytical reports
  app.get("/api/reports", async (req, res) => {
    try {
      const reports = await storage.getAllReports();
      res.json(reports);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching reports: " + error.message });
    }
  });

  // Get free sample reports
  app.get("/api/reports/samples", async (req, res) => {
    try {
      const reports = await storage.getFreeSampleReports();
      res.json(reports);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching sample reports: " + error.message });
    }
  });

  // Download free sample report
  app.get("/api/reports/:id/download-sample", async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      const report = await storage.getReport(reportId);
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      if (!report.isFreeSample) {
        return res.status(403).json({ message: "This report is not a free sample" });
      }

      // Generate presigned download URL from Object Storage
      const downloadUrl = await generateDownloadUrl(report.objectStorageKey);
      
      res.json({ 
        success: true, 
        downloadUrl,
        title: report.title
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error generating sample download: " + error.message });
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
      res.status(500).json({ message: "Error fetching report: " + error.message });
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

      const amount = Math.round(parseFloat(report.price) * 100); // Convert to cents

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
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Confirm purchase after successful payment
  app.post("/api/confirm-purchase", async (req, res) => {
    try {
      const { paymentIntentId, reportId } = req.body;
      
      if (!paymentIntentId || !reportId) {
        return res.status(400).json({ message: "Payment intent ID and report ID are required" });
      }

      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
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

      // Generate presigned download URL from Object Storage
      const downloadUrl = await generateDownloadUrl(report.objectStorageKey);
      
      res.json({ 
        success: true, 
        purchase,
        downloadUrl,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error confirming purchase: " + error.message });
    }
  });

  // Free sample download endpoint
  app.get("/api/reports/:id/download-sample", async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      const report = await storage.getReport(reportId);
      
      if (!report || !report.isFreeSample) {
        return res.status(404).json({ 
          success: false, 
          message: "Free sample report not found" 
        });
      }

      console.log("Attempting to generate download URL for:", report.objectStorageKey);
      
      // Check if Object Storage credentials are available
      if (!process.env.REPLIT_OBJECT_STORAGE_ACCESS_KEY_ID || !process.env.REPLIT_OBJECT_STORAGE_SECRET_ACCESS_KEY) {
        console.error("Object Storage credentials not found");
        return res.status(500).json({ 
          success: false, 
          message: "Object Storage credentials not configured. Please set REPLIT_OBJECT_STORAGE_ACCESS_KEY_ID and REPLIT_OBJECT_STORAGE_SECRET_ACCESS_KEY in your Replit secrets." 
        });
      }

      // Generate presigned URL for download
      const downloadUrl = await generateDownloadUrl(report.objectStorageKey);
      console.log("Generated download URL successfully");
      
      res.json({
        success: true,
        downloadUrl,
        title: report.title
      });
    } catch (error: any) {
      console.error("Error generating sample download URL:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to generate download URL: " + error.message
      });
    }
  });

  // Debug endpoint to test Object Storage connection
  app.get("/api/debug/object-storage", async (req, res) => {
    try {
      console.log("Testing Object Storage connection...");
      
      // Check credentials
      const hasCredentials = !!(process.env.REPLIT_OBJECT_STORAGE_ACCESS_KEY_ID && process.env.REPLIT_OBJECT_STORAGE_SECRET_ACCESS_KEY);
      
      if (!hasCredentials) {
        return res.json({
          status: "error",
          message: "Object Storage credentials not found",
          credentials: false,
          help: "Please set REPLIT_OBJECT_STORAGE_ACCESS_KEY_ID and REPLIT_OBJECT_STORAGE_SECRET_ACCESS_KEY in your Replit secrets"
        });
      }

      // Test file existence for all reports
      const reports = await storage.getAllReports();
      const fileChecks = [];
      
      for (const report of reports) {
        try {
          const exists = await fileExists(report.objectStorageKey);
          fileChecks.push({
            reportId: report.id,
            title: report.title,
            objectKey: report.objectStorageKey,
            exists
          });
        } catch (error: any) {
          fileChecks.push({
            reportId: report.id,
            title: report.title,
            objectKey: report.objectStorageKey,
            exists: false,
            error: error.message
          });
        }
      }
      
      res.json({
        status: "success",
        credentials: true,
        bucketId: "replit-objstore-a6e33adf-1d44-4b44-b510-fd863c17033b",
        files: fileChecks
      });
    } catch (error: any) {
      console.error("Object Storage debug error:", error);
      res.json({
        status: "error",
        message: error.message,
        credentials: !!(process.env.REPLIT_OBJECT_STORAGE_ACCESS_KEY_ID && process.env.REPLIT_OBJECT_STORAGE_SECRET_ACCESS_KEY)
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
