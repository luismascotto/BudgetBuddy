import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { getCategoryIcon } from "@/lib/payment-methods";
import type { ExpenseWithDetails } from "@shared/schema";

interface CategoryOverviewProps {
  expenses: ExpenseWithDetails[];
}

export function CategoryOverview({ expenses }: CategoryOverviewProps) {
  const [period, setPeriod] = useState("current-month");
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  // Filter expenses by period
  const filterExpensesByPeriod = (expensesList: ExpenseWithDetails[]) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    switch (period) {
      case "current-month":
        return expensesList.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getFullYear() === currentYear && expenseDate.getMonth() === currentMonth;
        });
      case "last-month":
        const lastMonth = new Date(currentYear, currentMonth - 1);
        return expensesList.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getFullYear() === lastMonth.getFullYear() && 
                 expenseDate.getMonth() === lastMonth.getMonth();
        });
      case "last-quarter":
        const quarterStart = new Date(currentYear, currentMonth - 2, 1);
        return expensesList.filter(expense => new Date(expense.date) >= quarterStart);
      case "last-year":
        const yearStart = new Date(currentYear - 1, 0, 1);
        const yearEnd = new Date(currentYear - 1, 11, 31);
        return expensesList.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= yearStart && expenseDate <= yearEnd;
        });
      case "all-time":
        return expensesList;
      default:
        return expensesList;
    }
  };

  const filteredExpenses = filterExpensesByPeriod(expenses);

  // Group expenses by category
  const categoryTotals = filteredExpenses.reduce((acc, expense) => {
    const categoryId = expense.category.id;
    if (!acc[categoryId]) {
      acc[categoryId] = {
        category: expense.category,
        total: 0,
        count: 0,
      };
    }
    acc[categoryId].total += parseFloat(expense.amount);
    acc[categoryId].count += 1;
    return acc;
  }, {} as Record<number, { category: any; total: number; count: number }>);

  const categoryList = Object.values(categoryTotals).sort((a, b) => b.total - a.total);
  const totalSpent = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Gastos por Categoria</CardTitle>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Mês atual</SelectItem>
              <SelectItem value="last-month">Mês passado</SelectItem>
              <SelectItem value="last-quarter">Últimos 3 meses</SelectItem>
              <SelectItem value="last-year">Ano passado</SelectItem>
              <SelectItem value="all-time">Todos os tempos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categoryList.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma categoria encontrada</p>
          ) : (
            categoryList.map(({ category, total, count }) => {
              const CategoryIcon = getCategoryIcon(category.icon);
              const percentage = totalSpent > 0 ? (total / totalSpent) * 100 : 0;
              
              return (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-muted rounded-full p-2" style={{ backgroundColor: `${category.color}20` }}>
                      <CategoryIcon className="h-4 w-4" style={{ color: category.color }} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{category.name}</p>
                      <p className="text-sm text-muted-foreground">{count} transações</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{formatCurrency(total)}</p>
                    <div className="w-24 mt-1">
                      <Progress value={percentage} className="h-2" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
