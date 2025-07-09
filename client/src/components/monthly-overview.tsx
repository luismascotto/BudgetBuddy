import { ArrowDown, Target, ArrowUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ExpenseWithDetails } from "@shared/schema";

interface MonthlyOverviewProps {
  expenses: ExpenseWithDetails[];
}

export function MonthlyOverview({ expenses }: MonthlyOverviewProps) {
  const totalSpent = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  const budget = 3500.00; // This could come from settings
  const remaining = budget - totalSpent;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Gasto</p>
              <p className="text-2xl font-medium text-foreground">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <ArrowDown className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Orçamento</p>
              <p className="text-2xl font-medium text-foreground">{formatCurrency(budget)}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Restante</p>
              <p className={`text-2xl font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(remaining)}
              </p>
            </div>
            <div className={`${remaining >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-full p-3`}>
              {remaining >= 0 ? (
                <ArrowUp className="h-5 w-5 text-green-600" />
              ) : (
                <ArrowDown className="h-5 w-5 text-red-600" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
