import React from 'react';
import { 
  ShoppingBag, 
  Package, 
  Layers, 
  ClipboardList, 
  AlertTriangle, 
  Search, 
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';

export const Navbar: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    cartCount,
    setIsCartOpen,
    lowStockCount,
    outOfStockCount,
    searchQuery,
    setSearchQuery,
    resetToDefaults,
  } = useCommerce();

  const totalAlerts = lowStockCount + outOfStockCount;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top security guarantee bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium text-white">PCI-DSS Level 1 Certified Sandbox</span>
            <span className="text-slate-400 hidden sm:inline">• Real-time atomic inventory locks</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="hidden md:inline text-slate-300">Fast 2-Day Express Shipping</span>
            <button 
              onClick={() => {
                if (window.confirm('Reset catalog inventory and orders back to default demonstration state?')) {
                  resetToDefaults();
                }
              }}
              className="text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              title="Reset inventory to initial demo data"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Demo
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div 
            onClick={() => setViewMode('storefront')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md group-hover:bg-indigo-600 transition-colors">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 font-display flex items-center gap-1.5">
                NEXUS
                <span className="text-xs uppercase tracking-widest px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-sans font-semibold">
                  Commerce
                </span>
              </span>
              <p className="text-[11px] text-slate-600 leading-none">Catalog & Inventory System</p>
            </div>
          </div>

          {/* Search bar (primarily in storefront view) */}
          {viewMode === 'storefront' && (
            <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
              <Search className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by title, SKU, or specs..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-600 hover:text-slate-800"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* View mode switcher */}
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setViewMode('storefront')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'storefront'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Storefront</span>
              </button>

              <button
                onClick={() => setViewMode('inventory')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative cursor-pointer ${
                  viewMode === 'inventory'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Inventory Hub</span>
                {totalAlerts > 0 && (
                  <span className="flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                    {totalAlerts}
                  </span>
                )}
              </button>

              <button
                onClick={() => setViewMode('orders')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'orders'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Orders</span>
              </button>
            </div>

            {/* Cart Trigger Button */}
            <button
              id="cart-drawer-trigger"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-2 cursor-pointer ml-1"
              aria-label="View shopping cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-semibold hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-emerald-500 text-white text-[11px] font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {viewMode === 'storefront' && (
          <div className="pb-3 md:hidden">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, SKU, specs..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
