export type ProductCategory = 
  | 'Audio' 
  | 'Workstations' 
  | 'Wearables' 
  | 'Smart Home' 
  | 'Accessories';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  costPrice: number; // for inventory valuation & profit margin
  stock: number;
  lowStockThreshold: number;
  category: ProductCategory;
  images: string[];
  rating: number;
  reviewsCount: number;
  tags: string[];
  featured?: boolean;
  specifications: Record<string, string>;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = 'card' | 'upi' | 'apple_pay' | 'google_pay' | 'klarna';

export interface CardDetails {
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardBrand: 'rupay' | 'visa' | 'mastercard' | 'amex' | 'discover' | 'generic';
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentDetails: {
    brand?: string;
    last4?: string;
    transactionId: string;
    authCode: string;
    pciToken: string;
    fraudRiskScore: number; // 0-100, low risk < 20
    threeDSecureVerified: boolean;
    timestamp: string;
  };
  status: 'paid' | 'processing' | 'shipped' | 'delivered' | 'refunded';
  createdAt: string;
}

export interface InventoryAuditLog {
  id: string;
  sku: string;
  productName: string;
  change: number; // +10 or -2
  reason: 'order_placed' | 'manual_adjustment' | 'restock' | 'order_refunded';
  resultingStock: number;
  timestamp: string;
  referenceId?: string; // Order ID or User Action
  notes?: string;
}

export type AppViewMode = 'storefront' | 'inventory' | 'orders';
