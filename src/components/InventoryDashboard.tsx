import React, { useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ArrowDownRight, 
  ArrowUpRight, 
  RotateCw,
  Edit2,
  Boxes,
  Layers,
  Sparkles
} from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import { Product, ProductCategory } from '../types';
import { formatINR } from '../utils/currency';

export const InventoryDashboard: React.FC = () => {
  const { 
    products, 
    auditLogs, 
    adjustStock, 
    restockProduct, 
    addNewProduct,
    lowStockCount,
    outOfStockCount
  } = useCommerce();

  const [activeTab, setActiveTab] = useState<'catalog' | 'audit'>('catalog');
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'out' | 'healthy'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [restockModalProduct, setRestockModalProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState(25);

  // New Product Form State
  const [newProd, setNewProd] = useState({
    sku: '',
    name: '',
    description: '',
    price: 4999.00,
    costPrice: 2100.00,
    stock: 20,
    lowStockThreshold: 5,
    category: 'Workstations' as ProductCategory,
    images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1000&q=80'],
    tags: ['New Intake'],
    specifications: {
      'Warranty': '1 Year Standard',
      'Material': 'Industrial Polymer',
    },
  });

  // Calculate metrics
  const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const totalCostValuation = products.reduce((sum, p) => sum + p.costPrice * p.stock, 0);
  const totalRetailValuation = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const averageMargin = totalRetailValuation > 0 
    ? (((totalRetailValuation - totalCostValuation) / totalRetailValuation) * 100).toFixed(1) 
    : '0';

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchFilter.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

    let matchesStatus = true;
    if (statusFilter === 'low') {
      matchesStatus = p.stock > 0 && p.stock <= p.lowStockThreshold;
    } else if (statusFilter === 'out') {
      matchesStatus = p.stock <= 0;
    } else if (statusFilter === 'healthy') {
      matchesStatus = p.stock > p.lowStockThreshold;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.sku || !newProd.name) return;

    addNewProduct({
      ...newProd,
      rating: 5.0,
      reviewsCount: 1,
      createdAt: new Date().toISOString(),
    });

    setIsAddModalOpen(false);
    // Reset form
    setNewProd({
      sku: '',
      name: '',
      description: '',
      price: 99.00,
      costPrice: 45.00,
      stock: 20,
      lowStockThreshold: 5,
      category: 'Workstations',
      images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1000&q=80'],
      tags: ['New Intake'],
      specifications: {
        'Warranty': '1 Year Standard',
      },
    });
  };

  const handleConfirmRestock = () => {
    if (!restockModalProduct || restockQty <= 0) return;
    restockProduct(restockModalProduct.id, restockQty);
    setRestockModalProduct(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-600 mb-1 font-medium">
            <span>Operations</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Warehouse & Inventory Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 flex items-center gap-3">
            Inventory Management System
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-900 text-white font-sans font-medium">
              Live Sync
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Real-time SKU tracking, reorder thresholds, inventory valuation, and chronological audit ledger.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-2 hover:bg-indigo-600 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New SKU</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {/* Total SKUs */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 text-xs font-medium">
            <span>Active SKUs</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
              {products.length}
            </span>
            <span className="text-xs text-slate-600 font-medium">({totalUnits} units total)</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600">
            Across 5 product categories
          </div>
        </div>

        {/* Total Cost Valuation */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 text-xs font-medium">
            <span>Inventory Asset Value</span>
            <span className="text-sm font-bold text-emerald-600 font-sans">₹</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
              {formatINR(totalCostValuation, false)}
            </span>
            <span className="text-[11px] font-bold text-emerald-600">Cost Basis</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600">
            Retail potential: {formatINR(totalRetailValuation, false)}
          </div>
        </div>

        {/* Profit Margin */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 text-xs font-medium">
            <span>Gross Profit Margin</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
              {averageMargin}%
            </span>
            <span className="text-xs text-emerald-600 font-semibold">Healthy</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600">
            Weighted across catalog retail
          </div>
        </div>

        {/* Low Stock & Out of Stock Alerts */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 text-xs font-medium">
            <span>Replenishment Alerts</span>
            <AlertTriangle className={`w-4 h-4 ${lowStockCount > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
              {lowStockCount + outOfStockCount}
            </span>
            <div className="text-[11px] font-medium">
              <span className="text-amber-600">{lowStockCount} Low</span>
              <span className="text-slate-300 mx-1">•</span>
              <span className="text-rose-600">{outOfStockCount} Out</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-600">
            Automated threshold notifications
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Catalog Table vs Audit Ledger */}
      <div className="flex items-center gap-3 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 px-1 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'catalog'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Catalog Inventory Master</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs">
            {products.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 px-1 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Real-Time Audit Trail</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs">
            {auditLogs.length}
          </span>
        </button>
      </div>

      {/* VIEW 1: CATALOG INVENTORY MASTER */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter by SKU or Product Name..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Status and Category Filter Selectors */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-all ${
                    statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  All Status
                </button>
                <button
                  onClick={() => setStatusFilter('low')}
                  className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-all ${
                    statusFilter === 'low' ? 'bg-amber-100 text-amber-900 shadow-2xs font-bold' : 'text-slate-600'
                  }`}
                >
                  Low Stock ({lowStockCount})
                </button>
                <button
                  onClick={() => setStatusFilter('out')}
                  className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-all ${
                    statusFilter === 'out' ? 'bg-rose-100 text-rose-900 shadow-2xs font-bold' : 'text-slate-600'
                  }`}
                >
                  Out of Stock ({outOfStockCount})
                </button>
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="Audio">Audio</option>
                <option value="Workstations">Workstations</option>
                <option value="Wearables">Wearables</option>
                <option value="Smart Home">Smart Home</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
          </div>

          {/* Master Inventory Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Item & SKU</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Stock Level</th>
                    <th className="py-3.5 px-4">Threshold</th>
                    <th className="py-3.5 px-4">Cost</th>
                    <th className="py-3.5 px-4">Retail</th>
                    <th className="py-3.5 px-4">Margin</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-600">
                        No products match current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const isLow = p.stock > 0 && p.stock <= p.lowStockThreshold;
                      const isOut = p.stock <= 0;
                      const margin = (((p.price - p.costPrice) / p.price) * 100).toFixed(0);

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Item & SKU */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.images[0]}
                                alt=""
                                referrerPolicy="no-referrer"
                                className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <span className="font-semibold text-slate-900 block line-clamp-1">
                                  {p.name}
                                </span>
                                <span className="font-mono text-[11px] text-slate-600">
                                  {p.sku}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                              {p.category}
                            </span>
                          </td>

                          {/* Live Stock Level & Bar */}
                          <td className="py-3 px-4">
                            <div className="w-40">
                              <div className="flex items-center justify-between text-[11px] mb-1">
                                <span className={isOut ? 'text-rose-600 font-bold' : isLow ? 'text-amber-600 font-bold' : 'text-emerald-700 font-bold'}>
                                  {isOut ? '0 units (Sold Out)' : `${p.stock} units`}
                                </span>
                                {isLow && <span className="text-[10px] text-amber-600 font-bold">REORDER</span>}
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    isOut ? 'bg-rose-500 w-0' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${Math.min(100, (p.stock / 30) * 100)}%` }}
                                />
                              </div>

                              {/* Inline +/- Stock Stepper */}
                              <div className="flex items-center gap-1.5 mt-2">
                                <button
                                  onClick={() => adjustStock(p.id, p.stock - 1, 'manual_adjustment', 'Manual reduction by merchant')}
                                  disabled={p.stock <= 0}
                                  className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs disabled:opacity-30 cursor-pointer"
                                  title="Decrement 1 unit"
                                >
                                  -
                                </button>
                                <span className="text-[11px] font-mono text-slate-600 w-6 text-center">
                                  {p.stock}
                                </span>
                                <button
                                  onClick={() => adjustStock(p.id, p.stock + 1, 'manual_adjustment', 'Manual increment by merchant')}
                                  className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs cursor-pointer"
                                  title="Increment 1 unit"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* Threshold */}
                          <td className="py-3 px-4 font-mono text-slate-600">
                            {p.lowStockThreshold} units
                          </td>

                          {/* Cost */}
                          <td className="py-3 px-4 font-mono text-slate-600">
                            {formatINR(p.costPrice)}
                          </td>

                          {/* Retail */}
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {formatINR(p.price)}
                          </td>

                          {/* Margin */}
                          <td className="py-3 px-4">
                            <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                              {margin}%
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setRestockModalProduct(p);
                                setRestockQty(25);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <RotateCw className="w-3 h-3" />
                              <span>Restock</span>
                            </button>
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
      )}

      {/* VIEW 2: REAL-TIME AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-900">
                Inventory Movement Audit Trail
              </h3>
              <p className="text-[11px] text-slate-600">
                Every sale deduction, order refund restoration, batch restock, and manual update is permanently logged.
              </p>
            </div>
            <span className="text-xs font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700">
              {auditLogs.length} Events Recorded
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/60 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">SKU & Item</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Stock Change</th>
                  <th className="py-3 px-4">Resulting Balance</th>
                  <th className="py-3 px-4">Reference / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => {
                  const isPositive = log.change > 0;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()} • {new Date(log.timestamp).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-800 mr-2">{log.sku}</span>
                        <span className="text-slate-600 text-[11px]">{log.productName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          log.reason === 'order_placed'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : log.reason === 'restock'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : log.reason === 'order_refunded'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {log.reason.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">
                        <span className={`inline-flex items-center gap-0.5 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {isPositive ? `+${log.change}` : log.change} units
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {log.resultingStock} units
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        {log.referenceId && (
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 mr-1.5">
                            {log.referenceId}
                          </span>
                        )}
                        {log.notes || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RESTOCK MODAL */}
      {restockModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <h3 className="font-display font-bold text-lg text-slate-900">
              Replenish Inventory Batch
            </h3>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-600 font-mono block">{restockModalProduct.sku}</span>
              <strong className="text-slate-900 block text-sm mt-0.5">{restockModalProduct.name}</strong>
              <div className="mt-2 flex justify-between text-slate-600">
                <span>Current In-Stock:</span>
                <strong className="text-slate-900">{restockModalProduct.stock} units</strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Quantity to Restock:
              </label>
              <div className="flex gap-2">
                {[10, 25, 50, 100].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setRestockQty(qty)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border cursor-pointer ${
                      restockQty === qty ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    +{qty}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                value={restockQty}
                onChange={(e) => setRestockQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="mt-3 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between">
              <button
                type="button"
                onClick={() => setRestockModalProduct(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRestock}
                className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md cursor-pointer"
              >
                Confirm Restock (+{restockQty} Units)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW SKU MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 my-8 space-y-4 animate-in fade-in">
            <h3 className="font-display font-bold text-lg text-slate-900">
              Create New Inventory Catalog SKU
            </h3>

            <form onSubmit={handleCreateProduct} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AUD-HYP-99"
                    value={newProd.sku}
                    onChange={(e) => setNewProd({ ...newProd, sku: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value as ProductCategory })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Audio">Audio</option>
                    <option value="Workstations">Workstations</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Smart Home">Smart Home</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. StudioStream XLR Microphone"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Detailed product specification and notes..."
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={newProd.costPrice}
                    onChange={(e) => setNewProd({ ...newProd, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Retail Price (₹)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newProd.stock}
                    onChange={(e) => setNewProd({ ...newProd, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Low Stock Alert Level</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newProd.lowStockThreshold}
                    onChange={(e) => setNewProd({ ...newProd, lowStockThreshold: parseInt(e.target.value) || 5 })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-slate-900 text-white hover:bg-indigo-600 rounded-xl shadow-md cursor-pointer"
                >
                  Create & Intake Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
