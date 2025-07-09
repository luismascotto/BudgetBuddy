import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ExpenseWithDetails } from "@shared/schema";

interface MonthlyProjectionProps {
  expenses: ExpenseWithDetails[];
}

export function MonthlyProjection({ expenses }: MonthlyProjectionProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  // Calculate fixed expenses (recurring monthly expenses)
  const fixedExpenses = expenses
    .filter(expense => 
      expense.category.name === 'Moradia' || 
      expense.category.name === 'Energia' ||
      expense.isInstallment
    )
    .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

  // Calculate credit card installments for next month
  const installments = expenses
    .filter(expense => expense.isInstallment)
    .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

  // Estimate variable expenses based on current month's non-fixed expenses
  const variableExpenses = expenses
    .filter(expense => 
      expense.category.name !== 'Moradia' && 
      expense.category.name !== 'Energia' &&
      !expense.isInstallment
    )
    .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

  // Use average or a percentage of current variable expenses for estimation
  const estimatedVariableExpenses = variableExpenses * 0.8; // 80% of current month

  const totalProjection = fixedExpenses + installments + estimatedVariableExpenses;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projeção Próximo Mês</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Gastos fixos</span>
            <span className="font-medium">{formatCurrency(fixedExpenses)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Parcelas cartão</span>
            <span className="font-medium">{formatCurrency(installments)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Estimativa variável</span>
            <span className="font-medium">{formatCurrency(estimatedVariableExpenses)}</span>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Total estimado</span>
            <span className="text-lg font-bold text-primary">{formatCurrency(totalProjection)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
