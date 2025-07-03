// Script to update analytical report URLs with Object Storage URLs
import { db } from "../server/db";
import { analyticalReports } from "../shared/schema";
import { eq } from "drizzle-orm";
import { generateReportPdfUrl } from "../server/storage-utils";

// Mapping of report titles to their PDF filenames in Object Storage
const reportFileMapping = {
  "ステーブルコインの健全な発展に向けた分析": "ステーブルコインの健全な発展に向けた分析.pdf",
  "日本国内の暗号資産関連の法整備予定（2025年6月現在）": "日本国内の暗号資産関連の法整備予定.pdf",
  "「日本企業の海外進出支援・中東編」日・サウジビジョン２０３０": "日本企業の海外進出支援・中東編.pdf"
};

async function updateReportUrls() {
  console.log("Starting to update report URLs...");
  
  try {
    // Get all reports
    const reports = await db.select().from(analyticalReports);
    
    for (const report of reports) {
      const filename = reportFileMapping[report.title as keyof typeof reportFileMapping];
      
      if (filename) {
        const objectStorageUrl = generateReportPdfUrl(filename);
        
        // Update the report with the new URL
        await db
          .update(analyticalReports)
          .set({ fileUrl: objectStorageUrl })
          .where(eq(analyticalReports.id, report.id));
        
        console.log(`✅ Updated report "${report.title}" with URL: ${objectStorageUrl}`);
      } else {
        console.log(`⚠️  No filename mapping found for report: "${report.title}"`);
      }
    }
    
    console.log("✅ All reports updated successfully!");
  } catch (error) {
    console.error("❌ Error updating reports:", error);
  }
}

// If running this script directly
if (import.meta.main) {
  updateReportUrls();
}

export { updateReportUrls };