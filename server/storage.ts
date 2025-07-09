import { 
  categories, 
  paymentMethods, 
  expenses, 
  type Category, 
  type PaymentMethod, 
  type Expense,
  type InsertCategory,
  type InsertPaymentMethod,
  type InsertExpense,
  type ExpenseWithDetails
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { defaultCategories, defaultPaymentMethods } from "@/lib/categories";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Payment Methods
  getPaymentMethods(): Promise<PaymentMethod[]>;
  getPaymentMethodById(id: number): Promise<PaymentMethod | undefined>;
  createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethod(id: number, paymentMethod: Partial<InsertPaymentMethod>): Promise<PaymentMethod | undefined>;
  deletePaymentMethod(id: number): Promise<boolean>;

  // Expenses
  getExpenses(): Promise<ExpenseWithDetails[]>;
  getExpenseById(id: number): Promise<ExpenseWithDetails | undefined>;
  createExpense(expense: InsertExpense): Promise<ExpenseWithDetails>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<ExpenseWithDetails | undefined>;
  deleteExpense(id: number): Promise<boolean>;
  getExpensesByMonth(year: number, month: number): Promise<ExpenseWithDetails[]>;
}

export class MemStorage implements IStorage {
  private categories: Map<number, Category> = new Map();
  private paymentMethods: Map<number, PaymentMethod> = new Map();
  private expenses: Map<number, Expense> = new Map();
  private categoryIdCounter = 1;
  private paymentMethodIdCounter = 1;
  private expenseIdCounter = 1;

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Default categories
    const defaultCategories = [
      { name: "Moradia", icon: "home", color: "#1976D2", isDefault: true },
      { name: "Supermercado", icon: "shopping-cart", color: "#F57C00", isDefault: true },
      { name: "Alimentação", icon: "utensils", color: "#D32F2F", isDefault: true },
      { name: "Energia", icon: "bolt", color: "#388E3C", isDefault: true },
      { name: "Limpeza", icon: "spray-can", color: "#7B1FA2", isDefault: true },
      { name: "Cigarros", icon: "cigarette", color: "#5D4037", isDefault: true },
      { name: "Delivery", icon: "truck", color: "#FF5722", isDefault: true },
      { name: "Lanches", icon: "cookie", color: "#FF9800", isDefault: true },
    ];

    defaultCategories.forEach(category => {
      this.categories.set(this.categoryIdCounter, {
        id: this.categoryIdCounter++,
        ...category,
      });
    });

    // Default payment methods
    const defaultPaymentMethods = [
      { name: "Dinheiro", type: "cash", icon: "money-bill-wave", color: "#4CAF50", isDefault: true, billingDay: null },
      { name: "PIX", type: "pix", icon: "university", color: "#2196F3", isDefault: true, billingDay: null },
      { name: "Nubank", type: "credit", icon: "credit-card", color: "#8A2BE2", billingDay: 15, isDefault: true },
      { name: "Itaú", type: "credit", icon: "credit-card", color: "#FF6900", billingDay: 8, isDefault: true },
    ];

    defaultPaymentMethods.forEach(method => {
      this.paymentMethods.set(this.paymentMethodIdCounter, {
        id: this.paymentMethodIdCounter++,
        ...method,
      });
    });
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const newCategory: Category = {
      id: this.categoryIdCounter++,
      ...category,
      isDefault: category.isDefault ?? false,
    };
    this.categories.set(newCategory.id, newCategory);
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const existing = this.categories.get(id);
    if (!existing) return undefined;

    const updated: Category = { ...existing, ...category };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Payment Methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return Array.from(this.paymentMethods.values());
  }

  async getPaymentMethodById(id: number): Promise<PaymentMethod | undefined> {
    return this.paymentMethods.get(id);
  }

  async createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const newPaymentMethod: PaymentMethod = {
      id: this.paymentMethodIdCounter++,
      ...paymentMethod,
      isDefault: paymentMethod.isDefault ?? false,
      billingDay: paymentMethod.billingDay ?? null,
    };
    this.paymentMethods.set(newPaymentMethod.id, newPaymentMethod);
    return newPaymentMethod;
  }

  async updatePaymentMethod(id: number, paymentMethod: Partial<InsertPaymentMethod>): Promise<PaymentMethod | undefined> {
    const existing = this.paymentMethods.get(id);
    if (!existing) return undefined;

    const updated: PaymentMethod = { ...existing, ...paymentMethod };
    this.paymentMethods.set(id, updated);
    return updated;
  }

  async deletePaymentMethod(id: number): Promise<boolean> {
    return this.paymentMethods.delete(id);
  }

  // Expenses
  async getExpenses(): Promise<ExpenseWithDetails[]> {
    const expenses = Array.from(this.expenses.values());
    return expenses.map(expense => this.addExpenseDetails(expense));
  }

  async getExpenseById(id: number): Promise<ExpenseWithDetails | undefined> {
    const expense = this.expenses.get(id);
    if (!expense) return undefined;
    return this.addExpenseDetails(expense);
  }

  async createExpense(expense: InsertExpense): Promise<ExpenseWithDetails> {
    const date = expense.date ? new Date(expense.date) : new Date();
    const newExpense: Expense = {
      id: this.expenseIdCounter++,
      amount: expense.amount,
      description: expense.description,
      categoryId: expense.categoryId,
      paymentMethodId: expense.paymentMethodId,
      date,
      installments: expense.installments ?? 1,
      currentInstallment: expense.currentInstallment ?? 1,
      parentExpenseId: expense.parentExpenseId ?? null,
      isInstallment: expense.isInstallment ?? false,
    };
    this.expenses.set(newExpense.id, newExpense);
    return this.addExpenseDetails(newExpense);
  }

  async updateExpense(id: number, expense: Partial<InsertExpense>): Promise<ExpenseWithDetails | undefined> {
    const existing = this.expenses.get(id);
    if (!existing) return undefined;

    const updated: Expense = { 
      ...existing, 
      ...expense,
      date: expense.date ? new Date(expense.date) : existing.date
    };
    this.expenses.set(id, updated);
    return this.addExpenseDetails(updated);
  }

  async deleteExpense(id: number): Promise<boolean> {
    return this.expenses.delete(id);
  }

  async getExpensesByMonth(year: number, month: number): Promise<ExpenseWithDetails[]> {
    const expenses = Array.from(this.expenses.values()).filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === year && expenseDate.getMonth() === month - 1;
    });
    return expenses.map(expense => this.addExpenseDetails(expense));
  }

  private addExpenseDetails(expense: Expense): ExpenseWithDetails {
    const category = this.categories.get(expense.categoryId)!;
    const paymentMethod = this.paymentMethods.get(expense.paymentMethodId)!;
    return {
      ...expense,
      category,
      paymentMethod,
    };
  }
}

export class DatabaseStorage implements IStorage {
  async getCategories(): Promise<Category[]> {
    const results = await db.select().from(categories);
    if (results.length === 0) {
      // Initialize with default categories if none exist
      await this.initializeDefaultCategories();
      return await db.select().from(categories);
    }
    return results;
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values({
        ...category,
        isDefault: category.isDefault ?? false,
      })
      .returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory || undefined;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const results = await db.select().from(paymentMethods);
    if (results.length === 0) {
      // Initialize with default payment methods if none exist
      await this.initializeDefaultPaymentMethods();
      return await db.select().from(paymentMethods);
    }
    return results;
  }

  async getPaymentMethodById(id: number): Promise<PaymentMethod | undefined> {
    const [paymentMethod] = await db.select().from(paymentMethods).where(eq(paymentMethods.id, id));
    return paymentMethod || undefined;
  }

  async createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const [newPaymentMethod] = await db
      .insert(paymentMethods)
      .values({
        ...paymentMethod,
        isDefault: paymentMethod.isDefault ?? false,
        billingDay: paymentMethod.billingDay ?? null,
      })
      .returning();
    return newPaymentMethod;
  }

  async updatePaymentMethod(id: number, paymentMethod: Partial<InsertPaymentMethod>): Promise<PaymentMethod | undefined> {
    const [updatedPaymentMethod] = await db
      .update(paymentMethods)
      .set(paymentMethod)
      .where(eq(paymentMethods.id, id))
      .returning();
    return updatedPaymentMethod || undefined;
  }

  async deletePaymentMethod(id: number): Promise<boolean> {
    const result = await db.delete(paymentMethods).where(eq(paymentMethods.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getExpenses(): Promise<ExpenseWithDetails[]> {
    const results = await db.query.expenses.findMany({
      with: {
        category: true,
        paymentMethod: true,
      },
    });
    return results as ExpenseWithDetails[];
  }

  async getExpenseById(id: number): Promise<ExpenseWithDetails | undefined> {
    const expense = await db.query.expenses.findFirst({
      where: eq(expenses.id, id),
      with: {
        category: true,
        paymentMethod: true,
      },
    });
    return expense as ExpenseWithDetails | undefined;
  }

  async createExpense(expense: InsertExpense): Promise<ExpenseWithDetails> {
    const [newExpense] = await db
      .insert(expenses)
      .values({
        ...expense,
        date: expense.date ? new Date(expense.date) : new Date(),
        installments: expense.installments ?? 1,
        currentInstallment: expense.currentInstallment ?? 1,
        parentExpenseId: expense.parentExpenseId ?? null,
        isInstallment: expense.isInstallment ?? false,
      })
      .returning();

    // Fetch the complete expense with relations
    const completeExpense = await db.query.expenses.findFirst({
      where: eq(expenses.id, newExpense.id),
      with: {
        category: true,
        paymentMethod: true,
      },
    });

    return completeExpense as ExpenseWithDetails;
  }

  async updateExpense(id: number, expense: Partial<InsertExpense>): Promise<ExpenseWithDetails | undefined> {
    const updateData: any = { ...expense };
    if (updateData.date && typeof updateData.date === 'string') {
      updateData.date = new Date(updateData.date);
    }

    const [updatedExpense] = await db
      .update(expenses)
      .set(updateData)
      .where(eq(expenses.id, id))
      .returning();

    if (!updatedExpense) return undefined;

    // Fetch the complete expense with relations
    const completeExpense = await db.query.expenses.findFirst({
      where: eq(expenses.id, updatedExpense.id),
      with: {
        category: true,
        paymentMethod: true,
      },
    });

    return completeExpense as ExpenseWithDetails;
  }

  async deleteExpense(id: number): Promise<boolean> {
    const result = await db.delete(expenses).where(eq(expenses.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getExpensesByMonth(year: number, month: number): Promise<ExpenseWithDetails[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const results = await db.query.expenses.findMany({
      where: (expenses, { and, gte, lte }) => 
        and(
          gte(expenses.date, startDate),
          lte(expenses.date, endDate)
        ),
      with: {
        category: true,
        paymentMethod: true,
      },
    });

    return results as ExpenseWithDetails[];
  }

  private async initializeDefaultCategories(): Promise<void> {
    const defaultCategoriesData = defaultCategories.map(cat => ({
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      isDefault: true,
    }));

    await db.insert(categories).values(defaultCategoriesData);
  }

  private async initializeDefaultPaymentMethods(): Promise<void> {
    const defaultPaymentMethodsData = defaultPaymentMethods.map((pm: any) => ({
      name: pm.name,
      icon: pm.icon,
      color: pm.color,
      type: pm.type,
      isDefault: true,
      billingDay: pm.billingDay || null,
    }));

    await db.insert(paymentMethods).values(defaultPaymentMethodsData);
  }
}

export const storage = new DatabaseStorage();
