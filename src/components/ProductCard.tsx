import React from 'react';
import { ShoppingBag, Star, AlertCircle, CheckCircle2, Eye } from 'lucide-react';
import { Product } from '../types';
import { useCommerce } from '../context/CommerceContext';
import { formatINR } from '../utils/currency';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, setActiveProductModal } = useCommerce();

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;

  const handleCardClick = () => {
    setActiveProductModal(product);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={handleCardClick}
      className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:border-slate-400/80 hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Product Image Section */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Category & Tags */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase rounded-md bg-white/90 backdrop-blur-md text-slate-800 shadow-xs border border-slate-200/60">
            {product.category}
          </span>
          {product.featured && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-slate-900 text-white shadow-xs">
              Featured
            </span>
          )}
        </div>

        {/* Live Stock Status Indicator Tag */}
        <div className="absolute top-3 right-3 z-10">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-rose-50 text-rose-700 border border-rose-200 shadow-xs">
              <AlertCircle className="w-3 h-3" />
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-50 text-amber-700 border border-amber-200 shadow-xs animate-pulse">
              <AlertCircle className="w-3 h-3" />
              Only {product.stock} left
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/70 shadow-xs">
              <CheckCircle2 className="w-3 h-3" />
              In Stock ({product.stock})
            </span>
          )}
        </div>

        {/* Quick View Overlay Hover */}
        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="px-3.5 py-1.5 rounded-lg bg-white/95 text-slate-900 text-xs font-semibold shadow-md flex items-center gap-1.5 backdrop-blur-xs">
            <Eye className="w-3.5 h-3.5" /> Quick View
          </span>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* SKU Code & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5 font-mono">
            <span>{product.sku}</span>
            <div className="flex items-center gap-1 font-sans text-slate-700 font-medium">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-slate-600 font-normal">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-display font-semibold text-base text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action Section */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-slate-900 font-display">
                {formatINR(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-xs text-slate-600 line-through">
                  {formatINR(product.compareAtPrice)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-600">
              Tax included • Free returns
            </span>
          </div>

          <button
            id={`quick-add-${product.id}`}
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-600 cursor-not-allowed border border-slate-200'
                : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-xs active:scale-95'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? 'Sold Out' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
