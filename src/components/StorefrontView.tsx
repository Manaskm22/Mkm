import React, { useState } from 'react';
import { 
  Filter, 
  SlidersHorizontal, 
  ShieldCheck, 
  Lock, 
  Zap, 
  Layers, 
  Sparkles,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import { ProductCard } from './ProductCard';
import { ProductCategory } from '../types';

export const StorefrontView: React.FC = () => {
  const { 
    products, 
    selectedCategory, 
    setSelectedCategory, 
    searchQuery,
    lowStockCount,
    setViewMode
  } = useCommerce();

  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  const categories: ('All' | ProductCategory)[] = [
    'All',
    'Audio',
    'Workstations',
    'Wearables',
    'Smart Home',
    'Accessories',
  ];

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesCategory = 
      selectedCategory === 'All' || product.category === selectedCategory;

    const matchesSearch = 
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStock = inStockOnly ? product.stock > 0 : true;

    return matchesCategory && matchesSearch && matchesStock;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    // default featured
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Editorial Announcement Banner */}
      <section className="bg-slate-900 text-white rounded-3xl overflow-hidden relative shadow-lg mx-4 sm:mx-6 lg:mx-8 mt-6">
        <div className="relative z-10 px-6 sm:px-10 py-10 sm:py-14 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold backdrop-blur-md mb-4 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Next-Gen Engineering Collection 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-white leading-tight">
            Precision Audio & Minimalist Workstations.
          </h1>
          <p className="text-sm text-slate-300 mt-3 leading-relaxed">
            Crafted for creators and developers. Every unit is monitored with atomic inventory synchronization and protected by PCI-DSS tokenized settlement.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-6">
            <button
              onClick={() => {
                const el = document.getElementById('catalog-grid');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-white text-slate-900 rounded-xl font-semibold text-xs hover:bg-slate-100 transition-colors shadow-sm cursor-pointer"
            >
              Explore Hardware Catalog
            </button>

            <button
              onClick={() => setViewMode('inventory')}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-xs transition-colors border border-white/15 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Merchant Inventory Hub</span>
              {lowStockCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>
          </div>
        </div>

        {/* Decorative corner background pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500 via-emerald-500 to-transparent pointer-events-none" />
      </section>

      {/* Feature Value Props Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 text-slate-700 shadow-xs">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h4 className="font-semibold text-xs text-slate-900">PCI-DSS Tokenized Gateway</h4>
              <p className="text-[11px] text-slate-600">Zero plain-text card storage & 3D Secure</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 border-t sm:border-t-0 sm:border-l border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h4 className="font-semibold text-xs text-slate-900">Real-Time Stock Locks</h4>
              <p className="text-[11px] text-slate-600">Live warehouse allocation on checkout</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 border-t sm:border-t-0 sm:border-l border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-semibold text-xs text-slate-900">Complimentary Express Air</h4>
              <p className="text-[11px] text-slate-600">Free delivery across India on orders over ₹5,000</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog Section */}
      <section id="catalog-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Filter Controls Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/90'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Secondary Sorting & In-Stock filter */}
          <div className="flex items-center gap-3 self-end md:self-auto text-xs">
            {/* In Stock toggle */}
            <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300"
              />
              <span>In-Stock Only</span>
            </label>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured Hardware</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {sortedProducts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-display font-semibold text-slate-800 text-base">No matching products found</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
              Try adjusting your category filter, clearing your search query, or checking out-of-stock items.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setInStockOnly(false);
              }}
              className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
