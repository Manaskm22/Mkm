import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order, InventoryAuditLog, AppViewMode } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockProducts';
import { generateAuthCode, generateToken, generateTransactionId } from '../utils/paymentSecurity';

interface CommerceContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  auditLogs: InventoryAuditLog[];
  viewMode: AppViewMode;
  setViewMode: (mode: AppViewMode) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  activeProductModal: Product | null;
  setActiveProductModal: (prod: Product | null) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  lastConfirmedOrder: Order | null;
  setLastConfirmedOrder: (order: Order | null) => void;

  // Cart Actions
  addToCart: (product: Product, quantity?: number) => { success: boolean; message: string };
  updateCartQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;

  // Inventory Management Actions
  adjustStock: (productId: string, newStock: number, reason?: InventoryAuditLog['reason'], notes?: string) => void;
  restockProduct: (productId: string, addQuantity: number) => void;
  addNewProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProductDetails: (productId: string, updates: Partial<Product>) => void;
  resetToDefaults: () => void;

  // Order & Payment Actions
  createOrder: (orderPayload: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status'>) => Promise<Order>;
  refundOrder: (orderId: string) => void;
  lowStockCount: number;
  outOfStockCount: number;
}

const CommerceContext = createContext<CommerceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'ecom_inventory_products_v3_inr',
  ORDERS: 'ecom_orders_v3_inr',
  AUDIT_LOGS: 'ecom_audit_logs_v3_inr',
  CART: 'ecom_cart_v3_inr',
};

export const CommerceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products & Inventory
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load products from storage', e);
    }
    return INITIAL_PRODUCTS;
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    }
    return [];
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load orders from storage', e);
    }
    return [
      {
        id: 'ord-demo-01',
        orderNumber: 'ORD-84920',
        items: [
          {
            productId: 'prod-01',
            name: 'AeroPulse Pro Wireless Studio Headphones',
            sku: 'AUD-APX-01',
            price: 28999.00,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
          },
        ],
        subtotal: 28999.00,
        discount: 0,
        tax: 5219.82,
        shipping: 0,
        total: 34218.82,
        shippingAddress: {
          fullName: 'Aarav Sharma',
          email: 'aarav.sharma@nexus.io',
          addressLine1: 'Indiranagar, 100 Feet Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
          country: 'India',
        },
        paymentMethod: 'card',
        paymentDetails: {
          brand: 'rupay',
          last4: '9010',
          transactionId: 'txn_9A8F2C10',
          authCode: '492810',
          pciToken: 'tok_pci_sec_demo1',
          fraudRiskScore: 3,
          threeDSecureVerified: true,
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        },
        status: 'shipped',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
    ];
  });

  // Inventory Audit Trail
  const [auditLogs, setAuditLogs] = useState<InventoryAuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load audit logs', e);
    }
    return [
      {
        id: 'log-01',
        sku: 'AUD-APX-01',
        productName: 'AeroPulse Pro Wireless Studio Headphones',
        change: -1,
        reason: 'order_placed',
        resultingStock: 14,
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        referenceId: 'ORD-84920',
        notes: 'Deducted 1 unit for customer purchase',
      },
      {
        id: 'log-02',
        sku: 'WRK-MEC-87',
        productName: 'ApexCraft Carbon Mechanical Keyboard',
        change: 10,
        reason: 'restock',
        resultingStock: 14,
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        referenceId: 'PO-2026-08',
        notes: 'Warehouse batch shipment received',
      },
    ];
  });

  // UI Navigation states
  const [viewMode, setViewMode] = useState<AppViewMode>('storefront');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [lastConfirmedOrder, setLastConfirmedOrder] = useState<Order | null>(null);

  // Sync to storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Derived counts
  const lowStockCount = products.filter(
    (p) => p.stock > 0 && p.stock <= p.lowStockThreshold
  ).length;

  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Cart operations with inventory validation
  const addToCart = (product: Product, quantity = 1): { success: boolean; message: string } => {
    const freshProduct = products.find((p) => p.id === product.id) || product;
    
    if (freshProduct.stock <= 0) {
      return { success: false, message: 'This item is currently out of stock.' };
    }

    const existingIndex = cart.findIndex((item) => item.product.id === freshProduct.id);
    const currentInCart = existingIndex > -1 ? cart[existingIndex].quantity : 0;
    const nextTotal = currentInCart + quantity;

    if (nextTotal > freshProduct.stock) {
      return {
        success: false,
        message: `Only ${freshProduct.stock} unit${freshProduct.stock > 1 ? 's' : ''} available in inventory.`,
      };
    }

    if (existingIndex > -1) {
      const nextCart = [...cart];
      nextCart[existingIndex].quantity = nextTotal;
      setCart(nextCart);
    } else {
      setCart([...cart, { product: freshProduct, quantity }]);
    }

    setIsCartOpen(true);
    return { success: true, message: `Added to cart!` };
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            if (nextQty > product.stock) return item; // capped at current stock
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Inventory Management
  const adjustStock = (
    productId: string,
    newStock: number,
    reason: InventoryAuditLog['reason'] = 'manual_adjustment',
    notes?: string
  ) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    const safeStock = Math.max(0, Math.floor(newStock));
    const delta = safeStock - target.stock;

    if (delta === 0) return;

    // Log the audit
    const newAuditLog: InventoryAuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sku: target.sku,
      productName: target.name,
      change: delta,
      reason,
      resultingStock: safeStock,
      timestamp: new Date().toISOString(),
      notes: notes || (delta > 0 ? `Stock adjusted upwards (+${delta})` : `Stock adjusted downwards (${delta})`),
    };

    setAuditLogs((prev) => [newAuditLog, ...prev]);

    // Update product stock
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: safeStock } : p))
    );

    // If item is in cart and exceeds new stock, clamp or remove
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            if (safeStock === 0) return null;
            if (item.quantity > safeStock) {
              return { ...item, quantity: safeStock };
            }
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const restockProduct = (productId: string, addQuantity: number) => {
    const target = products.find((p) => p.id === productId);
    if (!target || addQuantity <= 0) return;

    const newTotal = target.stock + addQuantity;
    adjustStock(productId, newTotal, 'restock', `Replenished +${addQuantity} units via Restock Order`);
  };

  const addNewProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newId = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    setProducts((prev) => [newProduct, ...prev]);

    // Record initial inventory stock audit
    if (newProduct.stock > 0) {
      const newAuditLog: InventoryAuditLog = {
        id: `log-${Date.now()}`,
        sku: newProduct.sku,
        productName: newProduct.name,
        change: newProduct.stock,
        reason: 'restock',
        resultingStock: newProduct.stock,
        timestamp: new Date().toISOString(),
        notes: `Initial catalog intake for SKU ${newProduct.sku}`,
      };
      setAuditLogs((prev) => [newAuditLog, ...prev]);
    }
  };

  const updateProductDetails = (productId: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updates } : p))
    );
  };

  const resetToDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    setCart([]);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CART);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    window.location.reload();
  };

  // Secure Order Processing & Automatic Inventory Lock/Decrement
  const createOrder = async (
    orderPayload: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status'>
  ): Promise<Order> => {
    // 1. Verify stock availability for all items before debiting
    for (const item of orderPayload.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod || prod.stock < item.quantity) {
        throw new Error(
          `Insufficient inventory for ${item.name}. Available: ${prod?.stock ?? 0}, Requested: ${item.quantity}`
        );
      }
    }

    // 2. Generate secure order number and cryptographic receipt
    const orderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: Order = {
      ...orderPayload,
      id: `ord-${Date.now()}`,
      orderNumber,
      status: 'paid',
      createdAt: new Date().toISOString(),
      paymentDetails: {
        ...orderPayload.paymentDetails,
        transactionId: orderPayload.paymentDetails.transactionId || generateTransactionId(),
        authCode: orderPayload.paymentDetails.authCode || generateAuthCode(),
        pciToken: orderPayload.paymentDetails.pciToken || generateToken(),
        timestamp: new Date().toISOString(),
      },
    };

    // 3. Atomically decrement stock for each item & log audit trail
    const auditEntries: InventoryAuditLog[] = [];
    const updatedProducts = products.map((prod) => {
      const orderItem = orderPayload.items.find((i) => i.productId === prod.id);
      if (orderItem) {
        const remaining = prod.stock - orderItem.quantity;
        auditEntries.push({
          id: `log-${Date.now()}-${prod.sku}`,
          sku: prod.sku,
          productName: prod.name,
          change: -orderItem.quantity,
          reason: 'order_placed',
          resultingStock: remaining,
          timestamp: new Date().toISOString(),
          referenceId: orderNumber,
          notes: `Purchased by ${orderPayload.shippingAddress.fullName}`,
        });
        return { ...prod, stock: remaining };
      }
      return prod;
    });

    setProducts(updatedProducts);
    setAuditLogs((prev) => [...auditEntries, ...prev]);
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setLastConfirmedOrder(newOrder);

    return newOrder;
  };

  const refundOrder = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder || targetOrder.status === 'refunded') return;

    // 1. Mark status as refunded
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'refunded' } : o))
    );

    // 2. Replenish inventory back to catalog
    const auditEntries: InventoryAuditLog[] = [];
    setProducts((prev) =>
      prev.map((prod) => {
        const item = targetOrder.items.find((i) => i.productId === prod.id);
        if (item) {
          const restoredStock = prod.stock + item.quantity;
          auditEntries.push({
            id: `log-ref-${Date.now()}-${prod.sku}`,
            sku: prod.sku,
            productName: prod.name,
            change: item.quantity,
            reason: 'order_refunded',
            resultingStock: restoredStock,
            timestamp: new Date().toISOString(),
            referenceId: targetOrder.orderNumber,
            notes: `Restocked ${item.quantity} units due to order cancellation/refund`,
          });
          return { ...prod, stock: restoredStock };
        }
        return prod;
      })
    );

    setAuditLogs((prev) => [...auditEntries, ...prev]);
  };

  return (
    <CommerceContext.Provider
      value={{
        products,
        cart,
        orders,
        auditLogs,
        viewMode,
        setViewMode,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        isCartOpen,
        setIsCartOpen,
        activeProductModal,
        setActiveProductModal,
        isCheckoutOpen,
        setIsCheckoutOpen,
        lastConfirmedOrder,
        setLastConfirmedOrder,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        adjustStock,
        restockProduct,
        addNewProduct,
        updateProductDetails,
        resetToDefaults,
        createOrder,
        refundOrder,
        lowStockCount,
        outOfStockCount,
      }}
    >
      {children}
    </CommerceContext.Provider>
  );
};

export const useCommerce = () => {
  const context = useContext(CommerceContext);
  if (!context) {
    throw new Error('useCommerce must be used within a CommerceProvider');
  }
  return context;
};
