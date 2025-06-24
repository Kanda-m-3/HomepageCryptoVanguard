import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get crypto prices from CoinGecko API
  app.get("/api/crypto-prices", async (req, res) => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple&vs_currencies=usd&include_24hr_change=true'
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

  const httpServer = createServer(app);
  return httpServer;
}
