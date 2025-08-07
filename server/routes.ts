import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCategorySchema, insertPaymentMethodSchema, insertExpenseSchema } from "@shared/schema";
import { z } from "zod";

// Authentication configuration from environment variables with defaults
const FIXED_USERNAME = process.env.BUDGET_USERNAME || "admin";
const FIXED_PASSWORD = process.env.BUDGET_PASSWORD || "budget123";
const SESSION_SECRET = process.env.BUDGET_SESSION_SECRET || "budget-buddy-secret-key-2024";

// Simple session storage (in production, use Redis or database)
const activeSessions = new Set<string>();

// Middleware to check authentication
const requireAuth = (req: any, res: any, next: any) => {
  const sessionId = req.cookies?.sessionId;
  
  if (!sessionId || !activeSessions.has(sessionId)) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Login route
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (username === FIXED_USERNAME && password === FIXED_PASSWORD) {
        // Generate session ID
        const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
        activeSessions.add(sessionId);
        
        // Set cookie with session ID
        res.cookie('sessionId', sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        res.json({ 
          success: true, 
          message: "Login successful",
          user: { username: FIXED_USERNAME }
        });
      } else {
        res.status(401).json({ 
          success: false, 
          message: "Invalid credentials" 
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout route
  app.post("/api/auth/logout", async (req, res) => {
    try {
      const sessionId = req.cookies?.sessionId;
      if (sessionId) {
        activeSessions.delete(sessionId);
      }
      
      res.clearCookie('sessionId');
      res.json({ success: true, message: "Logout successful" });
    } catch (error) {
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Check auth status
  app.get("/api/auth/status", async (req, res) => {
    try {
      const sessionId = req.cookies?.sessionId;
      const isAuthenticated = sessionId && activeSessions.has(sessionId);
      
      res.json({ 
        isAuthenticated,
        user: isAuthenticated ? { username: FIXED_USERNAME } : null
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to check auth status" });
    }
  });

  // Categories
  app.get("/api/categories", requireAuth, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to get categories" });
    }
  });

  app.post("/api/categories", requireAuth, async (req, res) => {
    try {
      const category = insertCategorySchema.parse(req.body);
      const created = await storage.createCategory(category);
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid category data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create category" });
      }
    }
  });

  app.put("/api/categories/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = insertCategorySchema.partial().parse(req.body);
      const updated = await storage.updateCategory(id, category);
      if (!updated) {
        res.status(404).json({ message: "Category not found" });
      } else {
        res.json(updated);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid category data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update category" });
      }
    }
  });

  app.delete("/api/categories/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCategory(id);
      if (!deleted) {
        res.status(404).json({ message: "Category not found" });
      } else {
        res.status(204).send();
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Payment Methods
  app.get("/api/payment-methods", requireAuth, async (req, res) => {
    try {
      const paymentMethods = await storage.getPaymentMethods();
      res.json(paymentMethods);
    } catch (error) {
      res.status(500).json({ message: "Failed to get payment methods" });
    }
  });

  app.post("/api/payment-methods", requireAuth, async (req, res) => {
    try {
      const paymentMethod = insertPaymentMethodSchema.parse(req.body);
      const created = await storage.createPaymentMethod(paymentMethod);
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid payment method data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create payment method" });
      }
    }
  });

  app.put("/api/payment-methods/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const paymentMethod = insertPaymentMethodSchema.partial().parse(req.body);
      const updated = await storage.updatePaymentMethod(id, paymentMethod);
      if (!updated) {
        res.status(404).json({ message: "Payment method not found" });
      } else {
        res.json(updated);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid payment method data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update payment method" });
      }
    }
  });

  app.delete("/api/payment-methods/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePaymentMethod(id);
      if (!deleted) {
        res.status(404).json({ message: "Payment method not found" });
      } else {
        res.status(204).send();
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete payment method" });
    }
  });

  // Expenses
  app.get("/api/expenses", requireAuth, async (req, res) => {
    try {
      const { year, month } = req.query;
      let expenses;
      
      if (year && month) {
        expenses = await storage.getExpensesByMonth(parseInt(year as string), parseInt(month as string));
      } else {
        expenses = await storage.getExpenses();
      }
      
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to get expenses" });
    }
  });

  app.post("/api/expenses", requireAuth, async (req, res) => {
    try {
      const expense = insertExpenseSchema.parse(req.body);
      const created = await storage.createExpense(expense);
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create expense" });
      }
    }
  });

  app.put("/api/expenses/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const expense = insertExpenseSchema.partial().parse(req.body);
      const updated = await storage.updateExpense(id, expense);
      if (!updated) {
        res.status(404).json({ message: "Expense not found" });
      } else {
        res.json(updated);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update expense" });
      }
    }
  });

  app.delete("/api/expenses/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteExpense(id);
      if (!deleted) {
        res.status(404).json({ message: "Expense not found" });
      } else {
        res.status(204).send();
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
