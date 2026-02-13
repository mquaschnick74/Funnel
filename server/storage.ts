import { type User, type InsertUser, type EmailTemplate, type InsertEmailTemplate } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser & { role?: string }): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;

  // Email template methods
  getEmailTemplates(): Promise<EmailTemplate[]>;
  getEmailTemplate(id: string): Promise<EmailTemplate | undefined>;
  createEmailTemplate(template: InsertEmailTemplate & { createdBy?: string }): Promise<EmailTemplate>;
  updateEmailTemplate(id: string, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined>;
  deleteEmailTemplate(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private emailTemplates: Map<string, EmailTemplate>;

  constructor() {
    this.users = new Map();
    this.emailTemplates = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser & { role?: string }): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      role: insertUser.role || "admin", // Default to admin for now
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      user.role = role;
      this.users.set(id, user);
      return user;
    }
    return undefined;
  }

  // Email template methods
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return Array.from(this.emailTemplates.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getEmailTemplate(id: string): Promise<EmailTemplate | undefined> {
    return this.emailTemplates.get(id);
  }

  async createEmailTemplate(template: InsertEmailTemplate & { createdBy?: string }): Promise<EmailTemplate> {
    const id = randomUUID();
    const emailTemplate: EmailTemplate = {
      ...template,
      id,
      createdBy: template.createdBy || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.emailTemplates.set(id, emailTemplate);
    return emailTemplate;
  }

  async updateEmailTemplate(id: string, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined> {
    const existing = this.emailTemplates.get(id);
    if (existing) {
      const updated: EmailTemplate = {
        ...existing,
        ...template,
        updatedAt: new Date(),
      };
      this.emailTemplates.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deleteEmailTemplate(id: string): Promise<boolean> {
    return this.emailTemplates.delete(id);
  }
}

export const storage = new MemStorage();
