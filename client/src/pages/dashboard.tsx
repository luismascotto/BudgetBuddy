import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Wallet, Menu, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MonthlyOverview } from "@/components/monthly-overview";
import { ExpenseList } from "@/components/expense-list";
import { CategoryOverview } from "@/components/category-overview";
import { ExpenseFormSimple as ExpenseForm } from "@/components/expense-form-simple";
import { MonthlyProjection } from "@/components/monthly-projection";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ExpenseWithDetails } from "@shared/schema";

export default function Dashboard() {
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const { data: expenses = [], isLoading } = useQuery<ExpenseWithDetails[]>({
    queryKey: ["/api/expenses"],
  });

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  };

  const handleExpenseAdded = () => {
    setIsExpenseDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Wallet className="h-6 w-6" />
              <h1 className="text-xl font-medium">Controle de Gastos</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-primary/20 rounded-lg px-3 py-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm capitalize">{formatMonth(currentDate)}</span>
              </div>
              {isMobile && (
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <MonthlyOverview expenses={expenses} />
            
            {/* Add Transaction Section - moved to main content */}
            <div className="bg-surface rounded-lg shadow-md p-6">
              <h2 className="text-lg font-medium mb-4">Adicionar Gasto</h2>
              <ExpenseForm onExpenseAdded={handleExpenseAdded} />
            </div>
            
            <ExpenseList expenses={expenses} isLoading={isLoading} />
            <CategoryOverview expenses={expenses} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <MonthlyProjection expenses={expenses} />
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      {isMobile && (
        <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
              size="icon"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Nova Despesa</h3>
              <ExpenseForm onExpenseAdded={handleExpenseAdded} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
