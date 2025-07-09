import { Button } from "@/components/ui/button";
import { getPaymentMethodIcon } from "@/lib/payment-methods";
import type { PaymentMethod } from "@shared/schema";

interface PaymentMethodSelectorProps {
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod | null;
  onPaymentMethodChange: (paymentMethod: PaymentMethod) => void;
}

export function PaymentMethodSelector({
  paymentMethods,
  selectedPaymentMethod,
  onPaymentMethodChange,
}: PaymentMethodSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {paymentMethods.map((method) => {
        const Icon = getPaymentMethodIcon(method.icon);
        const isSelected = selectedPaymentMethod?.id === method.id;
        
        return (
          <Button
            key={method.id}
            type="button"
            variant={isSelected ? "default" : "outline"}
            className={`flex items-center justify-center space-x-2 h-12 ${
              isSelected ? "" : "hover:bg-muted"
            }`}
            onClick={() => onPaymentMethodChange(method)}
          >
            <Icon className="h-4 w-4" style={{ color: isSelected ? undefined : method.color }} />
            <span className="text-sm">{method.name}</span>
          </Button>
        );
      })}
    </div>
  );
}
