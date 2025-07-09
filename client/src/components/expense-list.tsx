import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit2, Trash2, Calendar } from "lucide-react";
import { getPaymentMethodIcon, getCategoryIcon } from "@/lib/payment-methods";
import type { ExpenseWithDetails } from "@shared/schema";

interface ExpenseListProps {
  expenses: ExpenseWithDetails[];
  isLoading: boolean;
}

export function ExpenseList({ expenses, isLoading }: ExpenseListProps) {
  const [period, setPeriod] = useState("15");
  const [showDetailed, setShowDetailed] = useState(false);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const expenseDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - expenseDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      return `Hoje, ${expenseDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (diffDays === 2) {
      return `Ontem, ${expenseDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (diffDays <= 7) {
      return `${diffDays - 1} dias atrás, ${expenseDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return expenseDate.toLocaleDateString("pt-BR");
    }
  };

  // Group installment transactions by parentExpenseId
  const groupedExpenses = () => {
    const grouped: { [key: string]: ExpenseWithDetails[] } = {};
    const standalone: ExpenseWithDetails[] = [];

    expenses.forEach(expense => {
      if (expense.isInstallment && expense.currentInstallment === 1) {
        // This is the parent installment transaction
        const relatedExpenses = expenses.filter(e => 
          e.parentExpenseId === expense.id || e.id === expense.id
        );
        grouped[expense.id] = relatedExpenses.sort((a, b) => a.currentInstallment! - b.currentInstallment!);
      } else if (!expense.isInstallment) {
        standalone.push(expense);
      }
    });

    return { grouped, standalone };
  };

  // Filter expenses by period
  const filterByPeriod = (expensesList: ExpenseWithDetails[]) => {
    const now = new Date();
    const periodDays = parseInt(period);
    const cutoffDate = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000));
    
    return expensesList.filter(expense => new Date(expense.date) >= cutoffDate);
  };

  const { grouped, standalone } = groupedExpenses();
  const sortedExpenses = [...standalone].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const recentExpenses = showDetailed ? filterByPeriod(sortedExpenses) : sortedExpenses.slice(0, 5);

  // Get grouped installments for recent display
  const recentGroupedInstallments = Object.values(grouped)
    .filter(group => {
      const parentExpense = group[0];
      return showDetailed ? filterByPeriod([parentExpense]).length > 0 : true;
    })
    .sort((a, b) => new Date(b[0].date).getTime() - new Date(a[0].date).getTime());
  
  const limitedGroupedInstallments = showDetailed ? recentGroupedInstallments : recentGroupedInstallments.slice(0, 2);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transações Recentes</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary hover:text-primary/80"
              onClick={() => setShowDetailed(!showDetailed)}
            >
              {showDetailed ? "Resumo" : "Ver detalhes"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Grouped Installment Transactions */}
            {limitedGroupedInstallments.map((group) => {
              const parentExpense = group[0];
              const CategoryIcon = getCategoryIcon(parentExpense.category.icon);
              const PaymentIcon = getPaymentMethodIcon(parentExpense.paymentMethod.icon);
              const totalAmount = parseFloat(parentExpense.amount) * (parentExpense.installments || 1);
              
              return (
                <div key={parentExpense.id} className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors border-l-4 border-blue-500">
                  <div className="flex items-center space-x-3">
                    <div className="bg-muted rounded-full p-2" style={{ backgroundColor: `${parentExpense.category.color}20` }}>
                      <CategoryIcon className="h-4 w-4" style={{ color: parentExpense.category.color }} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {parentExpense.description.replace(/ \d+\/\d+$/, '')} em {parentExpense.installments}x de {formatCurrency(parseFloat(parentExpense.amount))}
                      </p>
                      <p className="text-sm text-muted-foreground">{formatDate(parentExpense.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{formatCurrency(totalAmount)}</p>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <PaymentIcon className="h-3 w-3" />
                      <span>{parentExpense.paymentMethod.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        {parentExpense.installments}x
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Standalone Transactions */}
            {recentExpenses.map((expense) => {
              const CategoryIcon = getCategoryIcon(expense.category.icon);
              const PaymentIcon = getPaymentMethodIcon(expense.paymentMethod.icon);
              
              return (
                <div key={expense.id} className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="bg-muted rounded-full p-2" style={{ backgroundColor: `${expense.category.color}20` }}>
                      <CategoryIcon className="h-4 w-4" style={{ color: expense.category.color }} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(expense.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{formatCurrency(parseFloat(expense.amount))}</p>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <PaymentIcon className="h-3 w-3" />
                      <span>{expense.paymentMethod.name}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {recentExpenses.length === 0 && limitedGroupedInstallments.length === 0 && (
              <p className="text-muted-foreground text-center py-8">Nenhuma transação encontrada</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Transaction List with Period Filter */}
      {showDetailed && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Histórico de Transações
              </CardTitle>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="15">Últimos 15 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="60">Últimos 60 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Detailed view of all transactions in period */}
              {filterByPeriod([...recentExpenses, ...limitedGroupedInstallments.flat()]).map((expense) => {
                const CategoryIcon = getCategoryIcon(expense.category.icon);
                const PaymentIcon = getPaymentMethodIcon(expense.paymentMethod.icon);
                
                return (
                  <div key={expense.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors group">
                    <div className="flex items-center space-x-3">
                      <div className="bg-muted rounded-full p-2" style={{ backgroundColor: `${expense.category.color}20` }}>
                        <CategoryIcon className="h-4 w-4" style={{ color: expense.category.color }} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{expense.description}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{formatDate(expense.date)}</span>
                          <span>•</span>
                          <span>{expense.category.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="font-medium text-foreground">{formatCurrency(parseFloat(expense.amount))}</p>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <PaymentIcon className="h-3 w-3" />
                          <span>{expense.paymentMethod.name}</span>
                          {expense.isInstallment && (
                            <span>({expense.currentInstallment}/{expense.installments}x)</span>
                          )}
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
