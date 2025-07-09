import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PaymentMethodSelector } from "@/components/payment-method-selector";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertExpenseSchema } from "@shared/schema";
import type { Category, PaymentMethod } from "@shared/schema";

const formSchema = insertExpenseSchema.extend({
  amount: z.string().min(1, "Valor é obrigatório"),
  date: z.string().optional(),
});

interface ExpenseFormProps {
  onExpenseAdded?: () => void;
}

export function ExpenseForm({ onExpenseAdded }: ExpenseFormProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [installments, setInstallments] = useState(1);
  const [amountDisplay, setAmountDisplay] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      description: "",
      categoryId: 0,
      paymentMethodId: 0,
      installments: 1,
      currentInstallment: 1,
      isInstallment: false,
      date: today,
    },
  });

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
    form.setValue('amount', formattedValue);
  };

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: paymentMethods = [] } = useQuery<PaymentMethod[]>({
    queryKey: ["/api/payment-methods"],
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const amountValue = parseFloat(amountDisplay.replace(/[^\d,]/g, '').replace(',', '.'));
      const isCredit = selectedPaymentMethod?.type === 'credit';
      const hasInstallments = isCredit && installments > 1;
      
      if (hasInstallments) {
        // Create installment expenses
        const installmentAmount = (amountValue / installments).toFixed(2);
        const expenses = [];
        
        for (let i = 0; i < installments; i++) {
          const installmentDate = new Date(data.date || today);
          installmentDate.setMonth(installmentDate.getMonth() + i);
          
          const expense = {
            amount: installmentAmount,
            description: `${data.description} ${i + 1}/${installments}`,
            categoryId: data.categoryId,
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
          description: data.description,
          categoryId: data.categoryId,
          paymentMethodId: selectedPaymentMethod?.id || 0,
          installments: 1,
          currentInstallment: 1,
          isInstallment: false,
          date: data.date || today,
        };
        
        const response = await apiRequest("POST", "/api/expenses", expense);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      form.reset({
        amount: "",
        description: "",
        categoryId: 0,
        paymentMethodId: 0,
        installments: 1,
        currentInstallment: 1,
        isInstallment: false,
        date: today,
      });
      setSelectedPaymentMethod(null);
      setInstallments(1);
      setAmountDisplay("");
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

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (!selectedPaymentMethod) {
      toast({
        title: "Erro",
        description: "Selecione uma forma de pagamento",
        variant: "destructive",
      });
      return;
    }
    
    createExpenseMutation.mutate(data);
  };

  const isCredit = selectedPaymentMethod?.type === 'credit';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    type="text"
                    placeholder="0,00"
                    className="pl-10"
                    value={amountDisplay}
                    onChange={handleAmountChange}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Descreva o gasto" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data</FormLabel>
              <FormControl>
                <Input {...field} type="date" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Forma de Pagamento</FormLabel>
          <PaymentMethodSelector
            paymentMethods={paymentMethods}
            selectedPaymentMethod={selectedPaymentMethod}
            onPaymentMethodChange={setSelectedPaymentMethod}
          />
        </div>

        {isCredit && (
          <div>
            <FormLabel>Parcelar em</FormLabel>
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
    </Form>
  );
}
