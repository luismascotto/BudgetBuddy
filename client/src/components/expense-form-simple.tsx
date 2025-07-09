import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PaymentMethodSelector } from "@/components/payment-method-selector";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Category, PaymentMethod } from "@shared/schema";

interface ExpenseFormProps {
  onExpenseAdded?: () => void;
}

export function ExpenseFormSimple({ onExpenseAdded }: ExpenseFormProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [installments, setInstallments] = useState(1);
  const [amountDisplay, setAmountDisplay] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: paymentMethods = [] } = useQuery<PaymentMethod[]>({
    queryKey: ["/api/payment-methods"],
  });

  // Remember last payment method
  useEffect(() => {
    const lastPaymentMethodId = localStorage.getItem('lastPaymentMethodId');
    if (lastPaymentMethodId && paymentMethods.length > 0) {
      const lastMethod = paymentMethods.find(pm => pm.id === parseInt(lastPaymentMethodId));
      if (lastMethod) {
        setSelectedPaymentMethod(lastMethod);
      }
    }
  }, [paymentMethods]);

  // Currency formatting functions
  const formatCurrency = (value: string) => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/\D/g, '');
    
    // Convert to cents and format
    const cents = parseInt(numericValue) || 0;
    const formatted = (cents / 100).toFixed(2).replace('.', ',');
    
    return formatted;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCurrency(e.target.value);
    setAmountDisplay(formattedValue);
  };

  const createExpenseMutation = useMutation({
    mutationFn: async () => {
      const amountValue = parseFloat(amountDisplay.replace(/[^\d,]/g, '').replace(',', '.'));
      const isCredit = selectedPaymentMethod?.type === 'credit';
      const hasInstallments = isCredit && installments > 1;
      
      if (hasInstallments) {
        // Create installment expenses
        const installmentAmount = (amountValue / installments).toFixed(2);
        const expenses = [];
        
        for (let i = 0; i < installments; i++) {
          const installmentDate = new Date(date);
          installmentDate.setMonth(installmentDate.getMonth() + i);
          
          const expense = {
            amount: installmentAmount,
            description: `${description} ${i + 1}/${installments}`,
            categoryId: categoryId,
            paymentMethodId: selectedPaymentMethod?.id || 0,
            installments: installments,
            currentInstallment: i + 1,
            isInstallment: true,
            date: installmentDate.toISOString().split('T')[0],
          };
          
          const response = await apiRequest("POST", "/api/expenses", expense);
          expenses.push(await response.json());
        }
        
        return expenses;
      } else {
        // Create single expense
        const expense = {
          amount: amountValue.toFixed(2),
          description: description,
          categoryId: categoryId,
          paymentMethodId: selectedPaymentMethod?.id || 0,
          installments: 1,
          currentInstallment: 1,
          isInstallment: false,
          date: date,
        };
        
        const response = await apiRequest("POST", "/api/expenses", expense);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      
      // Save the selected payment method for next time
      if (selectedPaymentMethod) {
        localStorage.setItem('lastPaymentMethodId', selectedPaymentMethod.id.toString());
      }
      
      // Reset form but keep payment method
      setAmountDisplay("");
      setDescription("");
      setCategoryId(0);
      setInstallments(1);
      setDate(new Date().toISOString().split('T')[0]);
      
      toast({
        title: "Sucesso!",
        description: "Gasto adicionado com sucesso",
      });
      onExpenseAdded?.();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao adicionar gasto",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amountDisplay || !description || !categoryId || !selectedPaymentMethod) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }
    
    createExpenseMutation.mutate();
  };

  const isCredit = selectedPaymentMethod?.type === 'credit';

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="amount">Valor</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            R$
          </span>
          <Input
            id="amount"
            type="text"
            placeholder="0,00"
            className="pl-10"
            value={amountDisplay}
            onChange={handleAmountChange}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="category">Categoria</Label>
        <Select value={categoryId.toString()} onValueChange={(value) => setCategoryId(parseInt(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          type="text"
          placeholder="Descreva o gasto"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="date">Data</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div>
        <Label>Forma de Pagamento</Label>
        <PaymentMethodSelector
          paymentMethods={paymentMethods}
          selectedPaymentMethod={selectedPaymentMethod}
          onPaymentMethodChange={setSelectedPaymentMethod}
        />
      </div>

      {isCredit && (
        <div>
          <Label htmlFor="installments">Parcelar em</Label>
          <Select value={installments.toString()} onValueChange={(value) => setInstallments(parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">À vista</SelectItem>
              {Array.from({ length: 23 }, (_, i) => i + 2).map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num}x
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={createExpenseMutation.isPending}>
        {createExpenseMutation.isPending ? "Adicionando..." : "Adicionar Gasto"}
      </Button>
    </form>
  );
}