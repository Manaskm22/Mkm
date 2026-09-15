import React from 'react';
import { 
  CheckCircle2, 
  X, 
  Printer, 
  Package, 
  ShieldCheck, 
  ArrowRight, 
  ExternalLink,
  Layers
} from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import { formatINR } from '../utils/currency';

export const OrderConfirmationModal: React.FC = () => {
  const { lastConfirmedOrder, setLastConfirmedOrder, setViewMode } = useCommerce();

  if (!lastConfirmedOrder) return null;

  const order = lastConfirmedOrder;

  const handlePrint = () => {
    window.print();
  };

  const handleGoToInventory = () => {
    setLastConfirmedOrder(null);
    setViewMode('inventory');
  };

  const handleGoToOrders = () => {
    setLastConfirmedOrder(null);
    setViewMode('orders');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div 
        id="order-confirmation-receipt"
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6"
      >
        {/* Header */}
        <div className="bg-emerald-600 text-white p-6 text-center relative">
          <button
            onClick={() => setLastConfirmedOrder(null)}
            className="absolute top-4 right-4 text-emerald-100 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold font-display">Payment Successfully Authorized</h3>
          <p className="text-emerald-100 text-xs mt-1">
            Order <span className="font-mono font-bold text-white">{order.orderNumber}</span> confirmed & catalog inventory updated
          </p>
        </div>

        {/* Receipt Details Body */}
        <div className="p-6 space-y-5 text-slate-700">
          {/* Transaction Metadata Card */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-slate-600 block uppercase font-mono">Transaction ID</span>
              <span className="font-mono font-bold text-slate-900">{order.paymentDetails.transactionId}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-600 block uppercase font-mono">Auth Code</span>
              <span className="font-mono font-bold text-slate-900">{order.paymentDetails.authCode}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-600 block uppercase font-mono">PCI Vault Token</span>
              <span className="font-mono text-slate-800 text-[11px] truncate block">{order.paymentDetails.pciToken}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-600 block uppercase font-mono">Security Check</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 3DS Passed
              </span>
            </div>
          </div>

          {/* Purchased Items List */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
              Purchased Items & Inventory Stock Reservation
            </h4>
            <div className="divide-y divide-slate-100 border-y border-slate-100 py-1 space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 block line-clamp-1">{item.name}</span>
                      <span className="text-[11px] text-slate-600 font-mono">
                        SKU: {item.sku} • Qty: {item.quantity}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatINR(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST (18%)</span>
              <span>{formatINR(order.tax)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span>{order.shipping === 0 ? 'FREE' : formatINR(order.shipping)}</span>
            </div>
            <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900 font-display">
              <span>Total Paid</span>
              <span>{formatINR(order.total)}</span>
            </div>
          </div>

          {/* Shipping Recipient Details */}
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-800 block mb-0.5">Shipping Destination:</span>
            <p>{order.shippingAddress.fullName} — {order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
            <p className="text-[11px] text-slate-600 mt-0.5">Tracking email confirmation dispatched to: {order.shippingAddress.email}</p>
          </div>

          {/* Inventory Notification Prompt */}
          <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Catalog inventory stock automatically debited.</span>
            </div>
            <button
              onClick={handleGoToInventory}
              className="text-indigo-600 font-bold hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>View Inventory Audit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleGoToOrders}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 cursor-pointer transition-colors"
              >
                Track in Orders
              </button>
              <button
                onClick={() => setLastConfirmedOrder(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold cursor-pointer transition-colors shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
