import { 
  CreditCard, 
  Banknote, 
  University, 
  Home,
  ShoppingCart,
  Utensils,
  Bolt,
  SprayCan,
  Truck,
  Cookie,
  Cigarette,
  LucideIcon
} from "lucide-react";

export function getPaymentMethodIcon(iconName: string): LucideIcon {
  const icons: Record<string, LucideIcon> = {
    "credit-card": CreditCard,
    "money-bill-wave": Banknote,
    "university": University,
  };
  
  return icons[iconName] || CreditCard;
}

export function getCategoryIcon(iconName: string): LucideIcon {
  const icons: Record<string, LucideIcon> = {
    "home": Home,
    "shopping-cart": ShoppingCart,
    "utensils": Utensils,
    "bolt": Bolt,
    "spray-can": SprayCan,
    "truck": Truck,
    "cookie": Cookie,
    "cigarette": Cigarette,
  };
  
  return icons[iconName] || Home;
}
