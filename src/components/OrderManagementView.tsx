import React, { useState } from 'react';
import { 
  ClipboardList, 
  ShieldCheck, 
  RotateCcw, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Search, 
  ArrowRight,
  Package,
  CreditCard
} from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import { formatINR } from '../utils/currency';

export const OrderManagementView: React.FC = () => {
  const { orders, refundOrder, setViewMode } = useCommerce();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter((o) => {
    const q = searchTerm.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.shippingAddress.fullName.toLowerCase().includes(q) ||
      o.shippingAddress.email.toLowerCase().includes(q) ||
      o.paymentDetails.transactionId.toLowerCase().includes(q)
    );
  });

  const handleRefund = (orderId: string, orderNumber: string) => {
    if (window.confirm(`Initiate refund for Order ${orderNumber}? This will mark the order as refunded and automatically replenish the reserved product units back into catalog inventory.`)) {
      refundOrder(orderId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-600 mb-1 font-medium">
            <span>Operations</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Customer Orders & Settlements</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 flex items-center gap-3">
            Orders & Payment Gateway Logs
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-900 text-white font-sans font-medium">
              {orders.length} Total
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Review tokenized customer transactions, 3D Secure authorizations, and fulfillment statuses.
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search orders, customers, txn ID..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Order & Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items Reserved</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Security / Tokenization</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-600">
                    <ClipboardList className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700 text-sm">No orders found</p>
                    <p className="text-xs text-slate-600 mt-1">Complete a checkout from the storefront to see orders live.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isRefunded = order.status === 'refunded';

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Order & Date */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 text-sm block">
                          {order.orderNumber}
                        </span>
                        <span className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block">
                          {order.shippingAddress.fullName}
                        </span>
                        <span className="text-[11px] text-slate-600">
                          {order.shippingAddress.email}
                        </span>
                        <span className="text-[10px] text-slate-600 block">
                          {order.shippingAddress.city}, {order.shippingAddress.state}
                        </span>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 max-w-xs">
                          {order.items.map((item, i) => (
                            <div key={i} className="text-[11px] flex items-center justify-between">
                              <span className="truncate mr-2 text-slate-800 font-medium">
                                {item.quantity}x {item.name}
                              </span>
                              <span className="font-mono text-slate-600 shrink-0">
                                {formatINR(item.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4">
                        <span className="font-display font-bold text-sm text-slate-900 block">
                          {formatINR(order.total)}
                        </span>
                        <span className="text-[10px] text-slate-600 uppercase font-mono">
                          {order.paymentMethod}
                        </span>
                      </td>

                      {/* Security / Tokenization */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 text-[11px]">
                          <div className="flex items-center gap-1 font-mono text-slate-800">
                            <CreditCard className="w-3 h-3 text-slate-500" />
                            <span>{order.paymentDetails.brand ? order.paymentDetails.brand.toUpperCase() : 'CARD'} •••• {order.paymentDetails.last4}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-600 truncate max-w-xs">
                            <span className="text-slate-600">Txn:</span> {order.paymentDetails.transactionId}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                            <ShieldCheck className="w-3 h-3" />
                            <span>3DS Verified • Auth {order.paymentDetails.authCode}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                            isRefunded
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : order.status === 'shipped'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span className="capitalize">{order.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {!isRefunded ? (
                          <button
                            onClick={() => handleRefund(order.id, order.orderNumber)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 font-medium text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Refund payment and restock items back into warehouse inventory"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Refund & Restock</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-600 italic">
                            Restocked to inventory
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
