import { users, analyticalReports, purchases, type User, type InsertUser, type InsertDiscordUser, type AnalyticalReport, type InsertAnalyticalReport, type Purchase, type InsertPurchase } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  getUserByStripeCustomerId(customerId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createOrUpdateDiscordUser(discordUser: InsertDiscordUser): Promise<User>;
  updateStripeCustomerId(userId: number, customerId: string): Promise<User>;
  updateSubscriptionInfo(userId: number, subscriptionData: {
    stripeSubscriptionId: string;
    subscriptionStatus: string;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  }): Promise<User>;
  updateVipStatus(userId: number, isVipMember: boolean): Promise<User>;
  
  getAllReports(): Promise<AnalyticalReport[]>;
  getReport(id: number): Promise<AnalyticalReport | undefined>;
  getFreeSampleReports(): Promise<AnalyticalReport[]>;
  createReport(report: InsertAnalyticalReport): Promise<AnalyticalReport>;
  
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getUserPurchases(userId: number): Promise<Purchase[]>;
  hasUserPurchasedReport(userId: number, reportId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private reports: Map<number, AnalyticalReport>;
  private purchases: Map<number, Purchase>;
  private currentUserId: number;
  private currentReportId: number;
  private currentPurchaseId: number;

  constructor() {
    this.users = new Map();
    this.reports = new Map();
    this.purchases = new Map();
    this.currentUserId = 1;
    this.currentReportId = 1;
    this.currentPurchaseId = 1;
    
    // Initialize with sample reports
    this.initializeSampleReports();
  }

  private initializeSampleReports() {
    const sampleReports: AnalyticalReport[] = [
      {
        id: this.currentReportId++,
        title: "ビットコイン市場分析レポート 2024年第1四半期",
        description: "ビットコインの価格動向、オンチェーン分析、および今後の予測を含む包括的な分析レポート",
        price: "2980",
        fileUrl: "/sample-reports/btc-q1-2024.pdf",
        isFreeSample: true,
        createdAt: new Date(),
      },
      {
        id: this.currentReportId++,
        title: "DeFiプロトコル詳細分析：Uniswap vs SushiSwap",
        description: "主要DeFiプロトコルの比較分析とリスク評価レポート",
        price: "4980",
        fileUrl: "/reports/defi-protocols-analysis.pdf",
        isFreeSample: false,
        createdAt: new Date(),
      },
      {
        id: this.currentReportId++,
        title: "Layer 2ソリューション投資ガイド",
        description: "Polygon、Arbitrum、Optimismなど主要Layer 2プロジェクトの投資機会分析",
        price: "3980",
        fileUrl: "/reports/layer2-investment-guide.pdf",
        isFreeSample: false,
        createdAt: new Date(),
      },
    ];

    sampleReports.forEach(report => {
      this.reports.set(report.id, report);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.discordId === discordId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      email: insertUser.email ?? null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      discordId: null,
      discordUsername: null,
      discordAvatar: null,
      isServerMember: false,
      isVipMember: false,
    };
    this.users.set(id, user);
    return user;
  }

  async createOrUpdateDiscordUser(discordUser: InsertDiscordUser): Promise<User> {
    if (!discordUser.discordId) {
      throw new Error("Discord ID is required");
    }

    const existingUser = await this.getUserByDiscordId(discordUser.discordId);
    
    if (existingUser) {
      // Update existing user
      const updatedUser: User = {
        ...existingUser,
        discordUsername: discordUser.discordUsername || existingUser.discordUsername,
        discordAvatar: discordUser.discordAvatar || existingUser.discordAvatar,
        email: discordUser.email || existingUser.email,
        isServerMember: discordUser.isServerMember ?? existingUser.isServerMember,
        isVipMember: discordUser.isVipMember ?? existingUser.isVipMember,
      };
      this.users.set(existingUser.id, updatedUser);
      return updatedUser;
    } else {
      // Create new user
      const id = this.currentUserId++;
      const user: User = {
        id,
        username: discordUser.discordUsername || 'discord_user',
        password: '', // Discord users don't need passwords
        email: discordUser.email ?? null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        discordId: discordUser.discordId,
        discordUsername: discordUser.discordUsername ?? null,
        discordAvatar: discordUser.discordAvatar ?? null,
        isServerMember: discordUser.isServerMember ?? false,
        isVipMember: discordUser.isVipMember ?? false,
      };
      this.users.set(id, user);
      return user;
    }
  }

  async updateStripeCustomerId(userId: number, customerId: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const updatedUser = { ...user, stripeCustomerId: customerId };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getAllReports(): Promise<AnalyticalReport[]> {
    return Array.from(this.reports.values());
  }

  async getReport(id: number): Promise<AnalyticalReport | undefined> {
    return this.reports.get(id);
  }

  async getFreeSampleReports(): Promise<AnalyticalReport[]> {
    return Array.from(this.reports.values()).filter(report => report.isFreeSample);
  }

  async createReport(insertReport: InsertAnalyticalReport): Promise<AnalyticalReport> {
    const id = this.currentReportId++;
    const report: AnalyticalReport = {
      ...insertReport,
      id,
      isFreeSample: insertReport.isFreeSample ?? false,
      createdAt: new Date(),
    };
    this.reports.set(id, report);
    return report;
  }

  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const id = this.currentPurchaseId++;
    const purchase: Purchase = {
      ...insertPurchase,
      id,
      userId: insertPurchase.userId ?? null,
      reportId: insertPurchase.reportId ?? null,
      purchasedAt: new Date(),
    };
    this.purchases.set(id, purchase);
    return purchase;
  }

  async getUserPurchases(userId: number): Promise<Purchase[]> {
    return Array.from(this.purchases.values()).filter(
      purchase => purchase.userId === userId
    );
  }

  async hasUserPurchasedReport(userId: number, reportId: number): Promise<boolean> {
    return Array.from(this.purchases.values()).some(
      purchase => purchase.userId === userId && purchase.reportId === reportId
    );
  }

  async getUserByStripeCustomerId(customerId: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.stripeCustomerId === customerId) {
        return user;
      }
    }
    return undefined;
  }

  async updateSubscriptionInfo(userId: number, subscriptionData: {
    stripeSubscriptionId: string;
    subscriptionStatus: string;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  }): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const updatedUser = { 
      ...user, 
      stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
      subscriptionStatus: subscriptionData.subscriptionStatus,
      currentPeriodEnd: subscriptionData.currentPeriodEnd,
      cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
      isVipMember: subscriptionData.subscriptionStatus === 'active'
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateVipStatus(userId: number, isVipMember: boolean): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const updatedUser = { ...user, isVipMember };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.discordId, discordId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        email: insertUser.email ?? null,
      })
      .returning();
    return user;
  }

  async createOrUpdateDiscordUser(discordUser: InsertDiscordUser): Promise<User> {
    if (!discordUser.discordId) {
      throw new Error("Discord ID is required");
    }

    const existingUser = await this.getUserByDiscordId(discordUser.discordId);
    
    if (existingUser) {
      // Update existing user
      const [user] = await db
        .update(users)
        .set({
          discordUsername: discordUser.discordUsername,
          discordAvatar: discordUser.discordAvatar,
          email: discordUser.email || existingUser.email,
          isServerMember: discordUser.isServerMember,
          isVipMember: discordUser.isVipMember,
        })
        .where(eq(users.discordId, discordUser.discordId))
        .returning();
      return user;
    } else {
      // Create new user
      const [user] = await db
        .insert(users)
        .values({
          username: discordUser.discordUsername || 'discord_user',
          password: '', // Discord users don't need passwords
          email: discordUser.email,
          discordId: discordUser.discordId,
          discordUsername: discordUser.discordUsername,
          discordAvatar: discordUser.discordAvatar,
          isServerMember: discordUser.isServerMember,
          isVipMember: discordUser.isVipMember,
        })
        .returning();
      return user;
    }
  }

  async updateStripeCustomerId(userId: number, customerId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getUserByStripeCustomerId(customerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));
    return user || undefined;
  }

  async updateSubscriptionInfo(userId: number, subscriptionData: {
    stripeSubscriptionId: string;
    subscriptionStatus: string;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
        subscriptionStatus: subscriptionData.subscriptionStatus,
        currentPeriodEnd: subscriptionData.currentPeriodEnd,
        cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
        isVipMember: subscriptionData.subscriptionStatus === 'active'
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateVipStatus(userId: number, isVipMember: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isVipMember })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getAllReports(): Promise<AnalyticalReport[]> {
    return await db.select().from(analyticalReports);
  }

  async getReport(id: number): Promise<AnalyticalReport | undefined> {
    const [report] = await db.select().from(analyticalReports).where(eq(analyticalReports.id, id));
    return report || undefined;
  }

  async getFreeSampleReports(): Promise<AnalyticalReport[]> {
    return await db.select().from(analyticalReports).where(eq(analyticalReports.isFreeSample, true));
  }

  async createReport(insertReport: InsertAnalyticalReport): Promise<AnalyticalReport> {
    const [report] = await db
      .insert(analyticalReports)
      .values({
        ...insertReport,
        isFreeSample: insertReport.isFreeSample ?? false,
      })
      .returning();
    return report;
  }

  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const [purchase] = await db
      .insert(purchases)
      .values({
        ...insertPurchase,
        userId: insertPurchase.userId ?? null,
        reportId: insertPurchase.reportId ?? null,
      })
      .returning();
    return purchase;
  }

  async getUserPurchases(userId: number): Promise<Purchase[]> {
    return await db.select().from(purchases).where(eq(purchases.userId, userId));
  }

  async hasUserPurchasedReport(userId: number, reportId: number): Promise<boolean> {
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(and(eq(purchases.userId, userId), eq(purchases.reportId, reportId)));
    return !!purchase;
  }
}

export const storage = new DatabaseStorage();
