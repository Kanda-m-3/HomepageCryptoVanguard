import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { generateReportPdfUrl, extractFileNameFromUrl } from "./storage-utils";
import { Client } from "@replit/object-storage";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil",
});

// Initialize Object Storage client 
// Try default bucket first to see if files are actually there
const objectStorageClient = new Client();

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Debug endpoint to explore Object Storage structure
  app.get("/api/debug/storage", async (req, res) => {
    try {
      const defaultClient = new Client();
      const result = await defaultClient.list();
      
      if (!result.ok) {
        return res.status(500).json({ error: result.error.message });
      }
      
      // Try to check if any file actually exists and can be downloaded
      const testResults = [];
      for (const file of result.value.slice(0, 1)) { // Test just the first file
        try {
          const downloadTest = await defaultClient.downloadAsBytes(file.name);
          testResults.push({
            fileName: file.name,
            canDownload: downloadTest.ok,
            error: downloadTest.ok ? null : downloadTest.error.message
          });
        } catch (error: any) {
          testResults.push({
            fileName: file.name,
            canDownload: false,
            error: error.message
          });
        }
      }
      
      res.json({ 
        files: result.value,
        downloadTests: testResults,
        environmentInfo: {
          hasReplitUser: !!process.env.REPL_ID,
          replId: process.env.REPL_ID || "not-available"
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Serve PDF files from Object Storage with multiple bucket attempts
  app.get("/api/serve-pdf/:filename", async (req, res) => {
    const filename = decodeURIComponent(req.params.filename);
    
    // List of approaches to try
    const downloadAttempts = [
      { client: new Client(), path: filename, description: "default bucket, direct path" },
      { client: new Client(), path: `ReportPDFs/${filename}`, description: "default bucket, with ReportPDFs prefix" },
    ];
    
    let lastError = null;
    
    for (const attempt of downloadAttempts) {
      try {
        console.log(`Trying ${attempt.description} with path: ${attempt.path}`);
        
        const result = await attempt.client.downloadAsBytes(attempt.path);
        
        if (result.ok) {
          // Success! Serve the file
          const fileBuffer = result.value;
          
          res.set({
            'Content-Type': 'application/pdf',
            'Cache-Control': 'public, max-age=3600'
          });
          
          console.log(`Successfully served ${filename} from ${attempt.description}`);
          return res.send(fileBuffer);
        } else {
          console.log(`Failed with ${attempt.description}: ${result.error.message}`);
          lastError = result.error;
        }
      } catch (error: any) {
        console.log(`Exception with ${attempt.description}: ${error.message}`);
        lastError = error;
      }
    }
    
    // If all attempts failed
    console.error(`All bucket attempts failed for file: ${filename}`);
    res.status(404).json({ 
      message: "PDF file not found in any bucket", 
      lastError: lastError?.message || "Unknown error",
      filename: filename
    });
  });
  
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

      res.json({ 
        success: true, 
        purchase,
        downloadUrl: report.fileUrl,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error confirming purchase: " + error.message });
    }
  });

  // Update report file URL with Object Storage URL
  app.post("/api/reports/:id/update-file-url", async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      const { fileName } = req.body;

      if (!fileName) {
        return res.status(400).json({ message: "File name is required" });
      }

      // Generate Object Storage URL
      const objectStorageUrl = generateReportPdfUrl(fileName);

      // Update the report
      const updatedReport = await storage.updateReportFileUrl(reportId, objectStorageUrl);

      if (!updatedReport) {
        return res.status(404).json({ message: "Report not found" });
      }

      res.json({ 
        success: true, 
        report: updatedReport,
        message: `Report file URL updated to Object Storage: ${objectStorageUrl}`
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error updating report file URL: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
